"""合併後確認 kuting.tw 已是新版：把這次改到的 .html 和線上檔案逐一比對（.nojekyll，線上應與倉庫完全相同）。"""
import hashlib, os, re, subprocess, sys, time, urllib.parse, urllib.request

SITE = "https://kuting.tw/"
WAIT_SECONDS = 20 * 60
before, after = os.environ.get("BEFORE", ""), os.environ.get("AFTER", "HEAD")

def changed_files():
    if before and not re.fullmatch(r"0+", before):
        out = subprocess.run(["git", "diff", "--name-only", "--diff-filter=AM", before, after], capture_output=True, text=True)
        if out.returncode == 0:
            return [f for f in out.stdout.splitlines() if f.endswith(".html")]
    # 手動執行或拿不到上一版：檢查各平台主頁
    return ["index.html"] + [d + "/index.html" for d in ("admin", "signup", "offering", "finance", "query", "stock", "volunteer") if os.path.exists(d + "/index.html")]

def norm(b):
    return b.replace(b"\r\n", b"\n").rstrip()

def url_of(path):
    p = path[:-len("index.html")] if path.endswith("index.html") else path
    return SITE + urllib.parse.quote(p) + "?deploycheck=" + after[:12] + str(int(time.time()))

def version_of(text):
    m = re.search(r"APP_VERSION\s*=\s*'([^']+)'", text) or re.search(r"\bv\d+(?:\.\d+)+\b", text)
    return m.group(1) if m and m.groups() else (m.group(0) if m else "")

def fetch(path):
    req = urllib.request.Request(url_of(path), headers={"User-Agent": "kuting-deploy-check", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

files = [f for f in changed_files() if os.path.exists(f)]
report = []
if not files:
    print("這次沒有改到網頁檔案"); open("deploy_report.md", "w").write("沒有網頁檔案要確認"); sys.exit(0)

want = {f: hashlib.sha256(norm(open(f, "rb").read())).hexdigest() for f in files}
pending = set(files)
start = time.time()
time.sleep(60)
while pending and time.time() - start < WAIT_SECONDS:
    for f in sorted(pending):
        try:
            if hashlib.sha256(norm(fetch(f))).hexdigest() == want[f]:
                pending.discard(f)
                print(f"✓ {f} 已上線（{int(time.time() - start)} 秒）")
        except Exception as e:
            print(f"… {f} 讀取失敗：{e}")
    if pending:
        time.sleep(45)

lines = []
for f in files:
    v = version_of(open(f, encoding="utf-8", errors="ignore").read())
    lines.append(f"| {f} | {v} | {'✅ 已上線' if f not in pending else '❌ 還是舊版'} |")
summary = "| 網頁 | 版號 | 結果 |\n|---|---|---|\n" + "\n".join(lines)
head = "這次合併的網頁全部已在 kuting.tw 上線。" if not pending else \
    f"合併後等了 {WAIT_SECONDS // 60} 分鐘，下列網頁在 kuting.tw 上還是舊版。可能是 GitHub Pages 部署失敗或延遲，請到 Actions 看「pages build and deployment」，或告訴 Claude。"
open("deploy_report.md", "w").write(head + "\n\n" + summary)
with open(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull), "a") as s:
    s.write("## 上線確認\n\n" + head + "\n\n" + summary + "\n")
print(head)
sys.exit(1 if pending else 0)
