#!/usr/bin/env python3
import base64, json, os
V = "/Volumes/ExternalSSD/portfolio-site/v2"
A = os.path.join(V, "assets")
MIME = {".jpg":"image/jpeg",".png":"image/png",".gif":"image/gif",".mp3":"audio/mpeg",".webp":"image/webp",".mp4":"video/mp4"}
assets = {}
for f in sorted(os.listdir(A)):
    stem, ext = os.path.splitext(f)
    if ext not in MIME or stem.startswith("hi_"): continue
    with open(os.path.join(A,f),"rb") as fh:
        assets[stem] = f"data:{MIME[ext]};base64," + base64.b64encode(fh.read()).decode()
gsap = open(os.path.join(A,"gsap.min.js")).read()
src = open(os.path.join(V,"index.src.html")).read()

# 1. inline build (artifact: must be self-contained)
out = src.replace("@@GSAP@@", gsap).replace("@@ASSETS_JSON@@", json.dumps(assets, ensure_ascii=False))
open(os.path.join(V,"index.html"),"w").write(out)
print(f"{len(assets)} assets embedded; index.html = {os.path.getsize(os.path.join(V,'index.html'))/1e6:.1f} MB (inline/artifact)")

# 2. web build (Vercel/Pages: tiny HTML + separate cached asset files)
import shutil
web_assets = {}
DA = os.path.join(V, "deploy", "assets")
os.makedirs(DA, exist_ok=True)
for f in sorted(os.listdir(A)):
    stem, ext = os.path.splitext(f)
    if ext not in MIME or stem.startswith("hi_"): continue
    shutil.copy2(os.path.join(A,f), os.path.join(DA,f))
    web_assets[stem] = "assets/" + f
web = src.replace("@@GSAP@@", gsap).replace("@@ASSETS_JSON@@", json.dumps(web_assets, ensure_ascii=False))
open(os.path.join(V,"deploy","index.html"),"w").write(web)
print(f"web build: deploy/index.html = {os.path.getsize(os.path.join(V,'deploy','index.html'))/1e3:.0f} KB + {len(web_assets)} asset files")
