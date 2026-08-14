import os
import re
import unicodedata
from PIL import Image

SRC = "images"
DST = "assets"
MAX_DIM = 1600
QUALITY = 82

CATEGORY_ORDER = [
    ("overview", "Selected Works"),
    ("animation", "Animation"),
    ("games", "Games"),
    ("illustration", "Illustration"),
    ("matte_painting", "Matte Painting"),
]

def slugify(name):
    name = os.path.splitext(name)[0]
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = re.sub(r"[^a-zA-Z0-9]+", "-", name)
    name = re.sub(r"-{2,}", "-", name).strip("-").lower()
    return name or "image"

def main():
    manifest = {}
    for category, label in CATEGORY_ORDER:
        src_dir = os.path.join(SRC, category)
        if not os.path.isdir(src_dir):
            continue
        out_dir = os.path.join(DST, category)
        os.makedirs(out_dir, exist_ok=True)
        files = sorted(
            f for f in os.listdir(src_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        entries = []
        for f in files:
            src_path = os.path.join(src_dir, f)
            slug = slugify(f)
            out_name = f"{slug}.jpg"
            out_path = os.path.join(out_dir, out_name)
            with Image.open(src_path) as im:
                if im.mode in ("RGBA", "P"):
                    im = im.convert("RGB")
                im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
                im.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            size = os.path.getsize(out_path)
            w, h = im.size
            entries.append({"src": f"assets/{category}/{out_name}", "w": w, "h": h, "size": size})
            print(f"  {category}: {f} -> {out_name} ({w}x{h}, {size//1024}KB)")
        manifest[category] = {"label": label, "items": entries}
        print(f"{category}: {len(entries)} images")

    with open(os.path.join(DST, "manifest.json"), "w") as fh:
        import json
        json.dump(manifest, fh, indent=2)
    print("Done.")

if __name__ == "__main__":
    main()
