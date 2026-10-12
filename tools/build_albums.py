"""整理「相簿」資料夾的照片，產生網站用的相簿清單 data/photos.js。

GitHub 每次收到新照片時會自動執行（.github/workflows/albums.yml）：
  1. 照片轉成 JPG、長邊縮到 1600 像素、轉正方向，並移除拍攝地點等資訊。
  2. 另外做一份小圖（長邊 480 像素）放在 images/thumbs，相簿列表載入比較快。
  3. 依資料夾名稱（例如「2027-02-13 玉皇大帝聖誕」）產生相簿名稱和日期。

在自己電腦執行：python3 tools/build_albums.py（需要 pip install pillow pillow-heif）
"""
import json
import os
import re
import shutil
import sys
from urllib.parse import quote

from PIL import Image, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALBUM_DIR = "相簿"
THUMB_DIR = os.path.join("images", "thumbs")
OUT = os.path.join("data", "photos.js")
FULL, THUMB = 1600, 480
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
NAME_RE = re.compile(r"^(\d{4})\D?(\d{1,2})\D?(\d{1,2})日?[\s_\-－．.]*(.+)$")


def natural_key(name):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", name)]


def url(path):
    return quote(path.replace(os.sep, "/"))


def process_photo(src):
    """縮圖、轉 JPG、去除 EXIF；回傳處理後的檔名。已處理過的照片不會再動。"""
    base, ext = os.path.splitext(src)
    dst = base + ".jpg"
    with Image.open(src) as im:
        done = ext.lower() == ".jpg" and max(im.size) <= FULL and not im.info.get("exif")
        if done:
            if dst != src:  # 副檔名大寫 .JPG 改成小寫
                os.rename(src, dst)
            return dst
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im, mask=im.convert("RGBA").split()[-1])
            im = bg
        im.thumbnail((FULL, FULL), Image.LANCZOS)
        if dst != src and os.path.exists(dst):
            dst = base + "-1.jpg"
        im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    if dst != src:
        os.remove(src)
    return dst


def make_thumb(src, dst):
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with Image.open(src) as im:
        im.thumbnail((THUMB, THUMB), Image.LANCZOS)
        im.save(dst, "JPEG", quality=78, optimize=True)


def read_note(folder):
    for name in ("說明.txt", "说明.txt"):
        p = os.path.join(folder, name)
        if os.path.exists(p):
            with open(p, encoding="utf-8-sig") as f:
                return f.read().strip()
    return ""


def main():
    os.chdir(ROOT)
    os.makedirs(ALBUM_DIR, exist_ok=True)
    os.makedirs(THUMB_DIR, exist_ok=True)
    albums, warnings, used_thumbs = [], [], set()

    for folder in sorted(os.listdir(ALBUM_DIR)):
        path = os.path.join(ALBUM_DIR, folder)
        if not os.path.isdir(path) or folder.startswith("."):
            continue
        m = NAME_RE.match(folder.strip())
        if not m:
            warnings.append("資料夾名稱要以日期開頭（例如 2027-02-13 玉皇大帝聖誕），已略過：" + folder)
            continue
        y, mo, d, title = m.groups()
        date = "%s-%02d-%02d" % (y, int(mo), int(d))

        photos = []
        for name in sorted(os.listdir(path), key=natural_key):
            src = os.path.join(path, name)
            if os.path.splitext(name)[1].lower() not in IMAGE_EXT or not os.path.isfile(src):
                continue
            try:
                src = process_photo(src)
            except Exception as e:  # 壞檔或不支援的格式：略過，不影響其他照片
                warnings.append("無法讀取照片，已略過：%s（%s）" % (src, e))
                continue
            thumb = os.path.join(THUMB_DIR, folder, os.path.basename(src))
            make_thumb(src, thumb)
            used_thumbs.add(os.path.normpath(thumb))
            photos.append({"src": url(src), "thumb": url(thumb), "name": os.path.basename(src)})

        if not photos:
            continue
        # 檔名以「封面」開頭的照片當封面，沒有的話用第一張
        cover = next((p for p in photos if p["name"].startswith("封面")), photos[0])
        albums.append({
            "id": date + "-" + re.sub(r"\s+", "-", title.strip()),
            "title": title.strip(),
            "date": date,
            "cover": cover["thumb"],
            "description": read_note(path),
            "photos": [{"src": p["src"], "thumb": p["thumb"]} for p in photos],
        })

    # 刪掉已經沒有對應照片的小圖
    if os.path.isdir(THUMB_DIR):
        for dirpath, _, files in os.walk(THUMB_DIR):
            for f in files:
                p = os.path.normpath(os.path.join(dirpath, f))
                if p not in used_thumbs:
                    os.remove(p)
        for dirpath, dirs, files in sorted(os.walk(THUMB_DIR), reverse=True):
            if dirpath != THUMB_DIR and not os.listdir(dirpath):
                shutil.rmtree(dirpath)

    albums.sort(key=lambda a: a["date"], reverse=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 此檔由系統依「相簿」資料夾自動產生，請不要手動修改。 */\n")
        f.write("window.PHOTO_ALBUMS = ")
        f.write(json.dumps(albums, ensure_ascii=False, indent=1))
        f.write(";\n")

    for w in warnings:
        print("::warning::" + w)
    print("相簿 %d 本，照片 %d 張" % (len(albums), sum(len(a["photos"]) for a in albums)))


if __name__ == "__main__":
    sys.exit(main())
