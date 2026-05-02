import logging
from logging.handlers import RotatingFileHandler
import os
from urllib.parse import urlparse

def setup_logger(name, filename, level=logging.DEBUG):
	# Ensure the logs directory exists
	log_dir = '../logs'
	if not os.path.exists(log_dir):
			os.makedirs(log_dir)

	# Set up the rotating file handler
	log_file = os.path.join(log_dir, filename)
	print(f"{name} log file is at { os.path.abspath(log_file)}")

	formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
	handler = logging.FileHandler(log_file, mode="a", encoding="utf-8")        
	handler.setFormatter(formatter)

	logger = logging.getLogger(name)
	logger.setLevel(level)
	logger.addHandler(handler)

	return logger

def verify_youtube_url(video_url: str) -> tuple[bool, str, str]:
	parsed_url = urlparse(video_url)
	hostname = parsed_url.hostname or ""

	if "youtube.com" in hostname:
		# /shorts/VIDEO_ID or /watch?v=VIDEO_ID
		paths = parsed_url.path.split("/")
		if "shorts" in paths:
			idx = paths.index("shorts")
			if idx + 1 < len(paths) and paths[idx + 1]:
				return True, None, paths[idx + 1]
		video_id = parsed_url.query
		# parse ?v=... manually
		for param in parsed_url.query.split("&"):
			if param.startswith("v="):
				return True, None, param[2:]
		return False, "Invalid YouTube URL - could not extract video ID", None

	if "youtu.be" in hostname:
		video_id = parsed_url.path.lstrip("/")
		if video_id:
			return True, None, video_id
		return False, "Invalid YouTube URL - could not extract video ID", None

	return False, "Invalid YouTube URL - not a YouTube link", None