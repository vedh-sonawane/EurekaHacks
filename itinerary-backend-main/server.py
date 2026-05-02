from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

import google.generativeai as genai

import json, requests, os, random, time
from functools import wraps
from dotenv import load_dotenv
from jose import jwt as jose_jwt

load_dotenv()

app = Flask(__name__)
cors = CORS(app)

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
_model = genai.GenerativeModel(
    "gemini-2.5-flash", generation_config={"response_mime_type": "application/json"}
)

# HTTP codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_INTERNAL_SERVER_ERROR = (500,)
HTTP_NOT_IMPLEMENTED = 501

# Video analysis metadata
NUM_FRAMES_TO_SAMPLE = 3

# Auth0 config
AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN", "")
AUTH0_AUDIENCE = os.environ.get("AUTH0_AUDIENCE", "")

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

_jwks_cache: dict = {"keys": None, "ts": 0.0}
_JWKS_TTL = 3600.0

_supabase_client = None

"""
Auth helpers
"""


def _get_jwks():
    now = time.time()
    if _jwks_cache["keys"] and now - _jwks_cache["ts"] < _JWKS_TTL:
        return _jwks_cache["keys"]
    resp = requests.get(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json", timeout=5)
    resp.raise_for_status()
    _jwks_cache["keys"] = resp.json()["keys"]
    _jwks_cache["ts"] = now
    return _jwks_cache["keys"]


def _verify_token(token):
    header = jose_jwt.get_unverified_header(token)
    keys = _get_jwks()
    rsa_key = next((k for k in keys if k.get("kid") == header.get("kid")), None)
    if not rsa_key:
        raise ValueError("No matching JWKS key")
    return jose_jwt.decode(
        token,
        rsa_key,
        algorithms=["RS256"],
        audience=AUTH0_AUDIENCE,
        issuer=f"https://{AUTH0_DOMAIN}/",
    )


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        try:
            payload = _verify_token(auth[7:])
            request.user_id = payload["sub"]
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase_client


"""
API calls setups
"""


# Get the first completion of the call
def gemini_api_call(user_prompt, system_prompt):
    response = _model.generate_content(f"{system_prompt}\n\n{user_prompt}")
    return response.text


# Get a response from video analysis API
def video_analysis_call(videos, dev=False):
    api_json = json.dumps(
        {"video_urls": videos, "num_frames_to_sample": NUM_FRAMES_TO_SAMPLE}
    )
    url = (
        os.environ["VIDEO_ANALYSIS_DEV_URL"]
        if dev == True
        else os.environ["VIDEO_ANALYSIS_PROD_URL"]
    )
    response = requests.post(
        url=url, headers={"Content-Type": "application/json"}, data=api_json
    )
    return response


def filter_skit(data):
    if isinstance(data, list):
        return [filter_skit(item) for item in data if not contains_skit(item)]
    if isinstance(data, dict):
        return {k: filter_skit(v) for k, v in data.items()}
    return data


def contains_skit(data):
    if isinstance(data, str):
        return "skit" in data.lower()
    if isinstance(data, list):
        return any(contains_skit(item) for item in data)
    if isinstance(data, dict):
        return any(contains_skit(v) for v in data.values())
    return False


"""
ROUTES
"""

"""
Use this call to test connection
"""


@app.route("/")
def index():
    return jsonify("Hello world"), HTTP_OK


@app.route("/generate_itinerary", methods=["POST"])
def generate_itinerary():
    args_user_prompt = request.args.get("prompt")
    if not args_user_prompt:
        return jsonify({"error": "No prompt found"}), HTTP_BAD_REQUEST

    video_urls_param = request.args.get("video_urls", "")
    videos = [v for v in video_urls_param.split(",") if v.strip()]

    if len(videos) > 5:
        videos = random.sample(videos, 5)

    video_summary = "The user have not specified any videos."
    if videos:
        try:
            response = video_analysis_call(videos, dev=False)
            if response.status_code == HTTP_OK:
                analyses = response.json()["video_analysis"]
                lines = []
                for i, item in enumerate(analyses):
                    url = videos[i] if i < len(videos) else "unknown"
                    content = item.get("content", "") if isinstance(item, dict) else str(item)
                    location = item.get("location", "") if isinstance(item, dict) else ""
                    lines.append(
                        f"Video {i + 1}:\n"
                        f"  URL: {url}\n"
                        f"  Content: {content}\n"
                        f"  Location: {location}"
                    )
                video_summary = "\n\n".join(lines)
        except Exception as e:
            print(f"Video analysis failed, skipping: {e}")

    with open("./prompts/system_prompt_vid_analysis.txt", "r") as f:
        system_prompt = f.read()
    with open("./prompts/prompt_with_vid_analysis.txt", "r") as f:
        user_prompt_template = f.read()
    user_prompt = user_prompt_template.replace(
        "<user_prompt>", args_user_prompt
    ).replace("<video_analysis>", video_summary)

    itinerary_str = gemini_api_call(user_prompt, system_prompt)
    itinerary_data = json.loads(itinerary_str)
    itinerary_data = filter_skit(itinerary_data)

    return jsonify({"itinerary": itinerary_data}), HTTP_CREATED


@app.route("/save_itinerary", methods=["POST"])
@require_auth
def save_itinerary():
    body = request.get_json(silent=True) or {}
    location = body.get("location", "")
    if not location:
        return jsonify({"error": "location required"}), HTTP_BAD_REQUEST
    result = (
        get_supabase()
        .table("itineraries")
        .insert({"user_id": request.user_id, "location": location, "data": body})
        .execute()
    )
    return jsonify({"id": result.data[0]["id"]}), HTTP_CREATED


@app.route("/my_itineraries", methods=["GET"])
@require_auth
def my_itineraries():
    result = (
        get_supabase()
        .table("itineraries")
        .select("id, location, created_at, data")
        .eq("user_id", request.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"itineraries": result.data}), HTTP_OK


@app.route("/delete_itinerary/<string:itinerary_id>", methods=["DELETE"])
@require_auth
def delete_itinerary(itinerary_id):
    (
        get_supabase()
        .table("itineraries")
        .delete()
        .eq("id", itinerary_id)
        .eq("user_id", request.user_id)
        .execute()
    )
    return jsonify({"ok": True}), HTTP_OK


if __name__ == "__main__":
    app.run(port=8080)
