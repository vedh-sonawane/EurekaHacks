import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

TARGET_URL = "https://www.tiktok.com/discover/what-to-do-in-rochester"
VIDEO_LINK_PATTERN = re.compile(r"/@[^/]+/video/\d+")


def build_driver() -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-infobars")
    options.add_argument("enable-automation")
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )


def scrape_video_links(url: str) -> list[str]:
    driver = build_driver()
    try:
        driver.get(url)
        WebDriverWait(driver, 50).until(
            EC.presence_of_element_located((By.ID, "bottom"))
        )
        return [
            tag.get_attribute("href")
            for tag in driver.find_elements(By.TAG_NAME, "a")
            if tag.get_attribute("href")
            and VIDEO_LINK_PATTERN.search(tag.get_attribute("href"))
        ]
    finally:
        driver.quit()


if __name__ == "__main__":
    links = scrape_video_links(TARGET_URL)
    print(links)
