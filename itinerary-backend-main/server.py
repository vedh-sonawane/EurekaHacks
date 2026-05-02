from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

import google.generativeai as genai

import json, requests, os, random
from dotenv import load_dotenv

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
                video_summary = str(response.json()["video_analysis"])
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

    return jsonify({"itinerary": itinerary_data}), HTTP_CREATED


if __name__ == "__main__":
    app.run(port=8080)
