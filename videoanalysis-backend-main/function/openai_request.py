import cv2
import PIL.Image
import numpy as np
from dotenv import load_dotenv
import os
import json
from function import utils
import time
import google.generativeai as genai

logger = utils.setup_logger(
    __name__, f"../logs/openai_request_logger_{int(time.time())}.log"
)

load_dotenv()

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

with open("./function/openai_analysis_json_template.txt") as f:
    analysis_template = f.read()

_model = genai.GenerativeModel(
    "gemini-2.5-flash", generation_config={"response_mime_type": "application/json"}
)


async def analyze_images(images: list, metadata: dict[str, str] = {}) -> dict:
    """
    Receives a list of cv2 images sampled from a video, sends them to Gemini,
    and returns the analysis as a dict.
    """
    prompt = (
        "These images are from a YouTube Shorts video. "
        "Analyze this video using simple and to-the-point vocab using this json format: "
        f"{analysis_template}"
        f"Included is a metadata of the video for better analysis: {json.dumps(metadata)} "
    )

    pil_images = []
    for image in images:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_images.append(PIL.Image.fromarray(rgb))

    try:
        response = await _model.generate_content_async([prompt, *pil_images])
        logger.info(f"Gemini vision response: {response.text}")
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini vision error: {e}")
        return {"error": "An error has happened"}


async def analyze_transcript(transcript: str, metadata: dict[str, str] = {}) -> dict:
    """
    Receives a transcript string from a video, sends it to Gemini,
    and returns the analysis as a dict.
    """
    prompt = (
        "This is a transcript from a YouTube Shorts video. "
        "Analyze this video in details using simple and to-the-point vocab using this json format: "
        f"{analysis_template}"
        f"Included is a metadata of the video for more things to analyze: {json.dumps(metadata)} "
        f"Transcript: {transcript}"
    )

    try:
        response = await _model.generate_content_async(prompt)
        logger.info(f"Gemini transcript response: {response.text}")
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini transcript error: {e}")
        return {"error": "An error has happened"}
