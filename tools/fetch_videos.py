"""抓古亭院 YouTube 頻道的影片標題，產生網站影片清單 data/channel_videos.js。

GitHub 每小時自動執行（.github/workflows/videos.yml）：
  讀 data/albums.js 裡 VIDEO_PLAYLIST 的頻道 ID，從 YouTube 公開的 RSS 取得最新 15 部影片，
  和原本清單合併（較舊的影片保留），依上傳日期由新到舊排列。

在自己電腦執行：python3 tools/fetch_videos.py
"""
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join("data", "albums.js")
OUT = os.path.join("data", "channel_videos.js")
FEED = "https://www.youtube.com/feeds/videos.xml?channel_id="
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
PREFIX = "window.CHANNEL_VIDEOS = "


def channel_id():
    with open(CONFIG, encoding="utf-8") as f:
        m = re.search(r'^window\.VIDEO_PLAYLIST\s*=\s*"[^"]*?(UC[\w-]{22})', f.read(), re.M)
    return m.group(1) if m else ""


def tw_date(iso):
    """YouTube 給的是世界標準時間，換成台灣日期"""
    try:
        t = datetime.fromisoformat(iso)
    except ValueError:
        return iso[:10]
    return t.astimezone(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")


def parse_feed(xml):
    videos = []
    for e in ET.fromstring(xml).findall("a:entry", NS):
        vid = e.findtext("yt:videoId", "", NS)
        if not vid:
            continue
        videos.append({
            "id": vid,
            "title": e.findtext("a:title", "", NS).strip(),
            "date": tw_date(e.findtext("a:published", "", NS)),
        })
    return videos


def load_existing():
    if not os.path.exists(OUT):
        return []
    with open(OUT, encoding="utf-8") as f:
        text = f.read()
    i = text.find(PREFIX)
    return json.loads(text[i + len(PREFIX):].rstrip().rstrip(";")) if i >= 0 else []


def write(videos):
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 此檔由系統依古亭院 YouTube 頻道自動產生，請不要手動修改。 */\n")
        f.write(PREFIX + json.dumps(videos, ensure_ascii=False, indent=1) + ";\n")


def main():
    os.chdir(ROOT)
    cid = channel_id()
    if not cid:
        print("data/albums.js 的 VIDEO_PLAYLIST 不是頻道網址，略過")
        return 0
    with urllib.request.urlopen(FEED + cid, timeout=30) as r:
        latest = parse_feed(r.read())
    # RSS 只有最新 15 部：較舊的影片沿用原本清單
    ids = {v["id"] for v in latest}
    videos = latest + [v for v in load_existing() if v["id"] not in ids]
    videos.sort(key=lambda v: v["date"], reverse=True)
    write(videos)
    print("影片 %d 部" % len(videos))
    return 0


if __name__ == "__main__":
    sys.exit(main())
