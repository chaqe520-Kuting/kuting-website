"""抓古亭院 YouTube 頻道的影片標題，產生網站影片清單 data/channel_videos.js。

GitHub 每小時自動執行（.github/workflows/videos.yml）：
  讀 data/albums.js 裡 VIDEO_PLAYLIST 的頻道 ID，用 yt-dlp 讀頻道「影片」分頁的全部影片；
  yt-dlp 失敗時改讀 YouTube 的 RSS（最新 15 部，較舊的影片沿用原本清單）。

在自己電腦執行：pip install yt-dlp，再執行 python3 tools/fetch_videos.py
"""
import json
import subprocess
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


def fetch_with_ytdlp(cid):
    """用 yt-dlp 讀頻道「影片」分頁（全部影片，新到舊）；沒有安裝或失敗回傳 None"""
    url = "https://www.youtube.com/channel/%s/videos" % cid
    try:
        out = subprocess.run(
            ["yt-dlp", "--flat-playlist", "-J", "--extractor-args", "youtubetab:approximate_date", url],
            capture_output=True, text=True, timeout=120, check=True).stdout
        entries = json.loads(out).get("entries") or []
    except Exception as e:
        print("yt-dlp 讀取失敗（%s）" % e)
        return None
    videos = []
    for e in entries:
        if not e.get("id"):
            continue
        d = e.get("upload_date") or ""
        if not d and e.get("timestamp"):
            d = datetime.fromtimestamp(e["timestamp"], timezone(timedelta(hours=8))).strftime("%Y%m%d")
        videos.append({"id": e["id"], "title": (e.get("title") or "").strip(),
                       "date": "%s-%s-%s" % (d[:4], d[4:6], d[6:8]) if len(d) == 8 else ""})
    print("yt-dlp 讀取成功：%d 部" % len(videos))
    return videos


def fetch_latest(cid):
    """依序試頻道 RSS、頻道「上傳的影片」清單 RSS；都失敗回傳 None"""
    urls = [FEED + cid, FEED.replace("channel_id", "playlist_id") + "UU" + cid[2:]]
    for url in urls:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "zh-TW"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                videos = parse_feed(r.read())
            print("讀取成功：%s（%d 部）" % (url, len(videos)))
            return videos
        except Exception as e:  # 網路或 YouTube 暫時錯誤：換下一個網址
            print("讀取失敗：%s（%s）" % (url, e))
    return None


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
    full = fetch_with_ytdlp(cid)
    latest = full if full is not None else fetch_latest(cid)
    if latest is None:
        print("::warning::暫時抓不到 YouTube 影片清單，網站維持原本的清單，下個小時再試")
        return 0
    old = {v["id"]: v for v in load_existing()}
    for v in latest:  # 抓不到日期時沿用原本的日期
        if not v["date"] and v["id"] in old:
            v["date"] = old[v["id"]]["date"]
    if full is None:  # RSS 只有最新 15 部：較舊的影片沿用原本清單
        ids = {v["id"] for v in latest}
        latest += [v for v in old.values() if v["id"] not in ids]
        latest.sort(key=lambda v: v["date"], reverse=True)
    videos = latest
    write(videos)
    print("影片 %d 部" % len(videos))
    return 0


if __name__ == "__main__":
    sys.exit(main())
