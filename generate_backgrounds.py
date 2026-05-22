#!/usr/bin/env python3
"""Generate section background images for NLP Mania landing page."""

import math
import random
from PIL import Image, ImageDraw, ImageFilter

W, H = 1920, 1080
random.seed(42)


def make_gradient(color1, color2, w=W, h=H, angle=135):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    rad = math.radians(angle)
    dx, dy = math.cos(rad), math.sin(rad)
    for y in range(h):
        for x in range(w):
            t = (x * dx + y * dy) / (w * abs(dx) + h * abs(dy) + 0.001)
            t = max(0, min(1, t))
            r = int(color1[0] + (color2[0] - color1[0]) * t)
            g = int(color1[1] + (color2[1] - color1[1]) * t)
            b = int(color1[2] + (color2[2] - color1[2]) * t)
            draw.point((x, y), (r, g, b))
    return img


def make_gradient_fast(color1, color2, w=W, h=H, vertical=True):
    import numpy as np
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    if vertical:
        for i, ch in enumerate(range(3)):
            arr[:, :, i] = np.linspace(color1[i], color2[i], h, dtype=np.uint8).reshape(-1, 1)
    else:
        for i in range(3):
            arr[:, :, i] = np.linspace(color1[i], color2[i], w, dtype=np.uint8).reshape(1, -1)
    return Image.fromarray(arr)


def blend(img1, img2, alpha=0.5):
    return Image.blend(img1.convert("RGB"), img2.convert("RGB"), alpha)


# ── 1. HERO ──────────────────────────────────────────────────────────────────
# Dark charcoal → deep navy, subtle neural network nodes
def hero():
    base = make_gradient_fast((15, 15, 25), (28, 22, 48), vertical=True)
    draw = ImageDraw.Draw(base)

    nodes = [(random.randint(0, W), random.randint(0, H)) for _ in range(60)]
    for i, (x1, y1) in enumerate(nodes):
        for x2, y2 in nodes[i+1:]:
            dist = math.hypot(x2 - x1, y2 - y1)
            if dist < 200:
                alpha = int(40 * (1 - dist / 200))
                draw.line((x1, y1, x2, y2), fill=(100, 80, 180, alpha), width=1)
    for x, y in nodes:
        r = random.randint(2, 6)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(120, 90, 200, 180))

    # Subtle radial glow top-left
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(20, 0, -1):
        alpha_val = int(255 * (1 - i / 20) * 0.12)
        size = i * 40
        gd.ellipse((-size // 2, -size // 2, size, size), fill=(80, 50, 160))
    base = blend(base, glow, 0.3)
    base = base.filter(ImageFilter.GaussianBlur(1))
    base.save("backgrounds/01_hero.jpg", quality=90)
    print("✓ 01_hero.jpg")


# ── 2. TE RECUNOȘTI ────────────────────────────────────────────────────────
# Light off-white with subtle dot grid — bright contrast section
def te_recunosti():
    base = Image.new("RGB", (W, H), (250, 250, 255))
    draw = ImageDraw.Draw(base)
    spacing = 36
    for x in range(0, W, spacing):
        for y in range(0, H, spacing):
            draw.ellipse((x - 1, y - 1, x + 1, y + 1), fill=(210, 215, 235))
    # Soft top gradient overlay
    for y in range(200):
        alpha = int(255 * (1 - y / 200) * 0.07)
        draw.line((0, y, W, y), fill=(100, 100, 200))
    base = base.filter(ImageFilter.GaussianBlur(0.5))
    base.save("backgrounds/02_te_recunosti.jpg", quality=90)
    print("✓ 02_te_recunosti.jpg")


# ── 3. PROBLEMA REALĂ ──────────────────────────────────────────────────────
# Very dark with scattered hexagons suggesting neural/brain grid
def problema_reala():
    base = make_gradient_fast((12, 12, 20), (20, 16, 35), vertical=True)
    draw = ImageDraw.Draw(base)

    def hex_points(cx, cy, r):
        return [(cx + r * math.cos(math.radians(60 * i - 30)),
                 cy + r * math.sin(math.radians(60 * i - 30))) for i in range(6)]

    cols = int(W / 90) + 2
    rows = int(H / 78) + 2
    for row in range(rows):
        for col in range(cols):
            cx = col * 90 + (45 if row % 2 else 0)
            cy = row * 78
            pts = hex_points(cx, cy, 38)
            brightness = random.randint(20, 45)
            draw.polygon(pts, outline=(brightness, brightness - 5, brightness + 15))

    base = base.filter(ImageFilter.GaussianBlur(1))
    base.save("backgrounds/03_problema_reala.jpg", quality=90)
    print("✓ 03_problema_reala.jpg")


# ── 4. CUM FUNCȚIONEAZĂ ───────────────────────────────────────────────────
# Dark with 3 vertical light columns suggesting the 3 steps
def cum_functioneaza():
    base = make_gradient_fast((18, 15, 32), (25, 20, 50), vertical=True)
    draw = ImageDraw.Draw(base)

    # 3 faint vertical column glows
    for i, col_x in enumerate([W // 4, W // 2, 3 * W // 4]):
        for r in range(350, 0, -10):
            opacity = int(18 * (1 - r / 350))
            draw.ellipse(
                (col_x - r, H // 2 - r, col_x + r, H // 2 + r),
                fill=(60 + i * 15, 50, 120 + i * 10)
            )

    # Horizontal flow lines
    for y in range(50, H, 60):
        alpha = random.randint(10, 30)
        dash_len = random.randint(40, 120)
        x_start = random.randint(0, W - dash_len)
        draw.line((x_start, y, x_start + dash_len, y),
                  fill=(alpha * 2, alpha, alpha * 3), width=1)

    base = base.filter(ImageFilter.GaussianBlur(2))
    base.save("backgrounds/04_cum_functioneaza.jpg", quality=90)
    print("✓ 04_cum_functioneaza.jpg")


# ── 5. CE ESTE INCLUS ─────────────────────────────────────────────────────
# Dark with subtle stacked-lines texture (like audio waveforms)
def ce_este_inclus():
    base = make_gradient_fast((14, 14, 22), (22, 18, 38), vertical=False)
    draw = ImageDraw.Draw(base)

    for i in range(80):
        y = random.randint(0, H)
        amplitude = random.randint(4, 24)
        freq = random.uniform(0.01, 0.04)
        for x in range(0, W, 2):
            wave_y = y + int(amplitude * math.sin(freq * x + i))
            brightness = random.randint(30, 55)
            draw.point((x, wave_y), fill=(brightness, brightness - 8, brightness + 20))

    base = base.filter(ImageFilter.GaussianBlur(1.5))
    base.save("backgrounds/05_ce_este_inclus.jpg", quality=90)
    print("✓ 05_ce_este_inclus.jpg")


# ── 6. CE VREI APLICA EFECTIV ─────────────────────────────────────────────
# Dark with card-grid light pattern (suggests the exercise cards)
def ce_vei_aplica():
    base = make_gradient_fast((16, 13, 28), (24, 20, 44), vertical=True)
    draw = ImageDraw.Draw(base)

    card_w, card_h = 240, 160
    cols = W // (card_w + 20) + 1
    rows = H // (card_h + 20) + 1

    for row in range(rows):
        for col in range(cols):
            x = col * (card_w + 20) + 10
            y = row * (card_h + 20) + 10
            brightness = random.randint(30, 48)
            draw.rounded_rectangle(
                (x, y, x + card_w, y + card_h),
                radius=12,
                outline=(brightness, brightness - 5, brightness + 18),
                width=1
            )

    base = base.filter(ImageFilter.GaussianBlur(2))
    base.save("backgrounds/06_ce_vei_aplica.jpg", quality=90)
    print("✓ 06_ce_vei_aplica.jpg")


# ── 7. CE VEI OBSERVA ─────────────────────────────────────────────────────
# Dark with radial sunrise glow (results/growth metaphor)
def ce_vei_observa():
    base = make_gradient_fast((10, 10, 20), (20, 15, 35), vertical=True)
    draw = ImageDraw.Draw(base)

    cx, cy = W // 2, H // 2
    for r in range(500, 0, -5):
        t = r / 500
        red = int(180 * (1 - t))
        green = int(100 * (1 - t))
        blue = int(220 * (1 - t))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r),
                     outline=(red, green, blue))

    # Radiating lines from center
    for angle in range(0, 360, 18):
        rad = math.radians(angle)
        x_end = cx + int(600 * math.cos(rad))
        y_end = cy + int(600 * math.sin(rad))
        draw.line((cx, cy, x_end, y_end), fill=(40, 25, 70), width=1)

    base = base.filter(ImageFilter.GaussianBlur(3))
    base.save("backgrounds/07_ce_vei_observa.jpg", quality=90)
    print("✓ 07_ce_vei_observa.jpg")


# ── 8. E PENTRU TINE ─────────────────────────────────────────────────────
# Dark with diagonal split — left darker, right slightly lighter (two-column)
def e_pentru_tine():
    base = Image.new("RGB", (W, H), (14, 12, 24))
    draw = ImageDraw.Draw(base)

    # Left panel
    for x in range(W // 2 + 80):
        brightness = int(14 + 6 * (x / (W // 2)))
        draw.line((x, 0, x, H), fill=(brightness, brightness - 2, brightness + 8))

    # Right panel slightly lighter
    for x in range(W // 2 - 80, W):
        brightness = int(22 + 8 * ((x - W // 2) / W))
        draw.line((x, 0, x, H), fill=(brightness, brightness - 2, brightness + 12))

    # Diagonal separator line
    draw.line((W // 2 - 80, 0, W // 2 + 80, H), fill=(60, 50, 100), width=2)

    # Dot texture overlay
    for _ in range(2000):
        x, y = random.randint(0, W), random.randint(0, H)
        draw.point((x, y), fill=(random.randint(35, 55), 30, random.randint(50, 70)))

    base = base.filter(ImageFilter.GaussianBlur(1))
    base.save("backgrounds/08_e_pentru_tine.jpg", quality=90)
    print("✓ 08_e_pentru_tine.jpg")


# ── 9. BONUSURI INCLUSE ───────────────────────────────────────────────────
# Dark with sparkle/star particles (bonus feel)
def bonusuri():
    base = make_gradient_fast((13, 11, 26), (22, 18, 42), vertical=True)
    draw = ImageDraw.Draw(base)

    # Stars/sparkles
    for _ in range(120):
        x, y = random.randint(0, W), random.randint(0, H)
        size = random.choice([1, 1, 2, 3])
        brightness = random.randint(100, 200)
        draw.ellipse((x - size, y - size, x + size, y + size),
                     fill=(brightness, brightness - 20, brightness + 40))

    # Larger star bursts
    for _ in range(15):
        x, y = random.randint(100, W - 100), random.randint(100, H - 100)
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            length = random.randint(8, 20)
            x2 = x + int(length * math.cos(rad))
            y2 = y + int(length * math.sin(rad))
            draw.line((x, y, x2, y2), fill=(140, 100, 200), width=1)

    base = base.filter(ImageFilter.GaussianBlur(1))
    base.save("backgrounds/09_bonusuri.jpg", quality=90)
    print("✓ 09_bonusuri.jpg")


# ── 10. DESPRE TRAINER ────────────────────────────────────────────────────
# Professional dark with subtle bokeh circles
def despre_trainer():
    base = make_gradient_fast((12, 12, 22), (26, 20, 40), vertical=False)
    draw = ImageDraw.Draw(base)

    # Bokeh circles
    for _ in range(40):
        x, y = random.randint(-100, W + 100), random.randint(-100, H + 100)
        r = random.randint(20, 80)
        brightness = random.randint(30, 60)
        draw.ellipse((x - r, y - r, x + r, y + r),
                     outline=(brightness, brightness - 10, brightness + 20),
                     width=1)

    # Faint left-side glow (like portrait light)
    for r in range(400, 0, -10):
        t = r / 400
        opacity = int(25 * (1 - t))
        draw.ellipse((W // 4 - r, H // 2 - r, W // 4 + r, H // 2 + r),
                     fill=(opacity + 10, opacity, opacity + 15))

    base = base.filter(ImageFilter.GaussianBlur(2))
    base.save("backgrounds/10_despre_trainer.jpg", quality=90)
    print("✓ 10_despre_trainer.jpg")


# ── 11. GARANȚIE ──────────────────────────────────────────────────────────
# Dark with subtle shield/trust pattern and green accent glow
def garantie():
    base = make_gradient_fast((11, 14, 22), (18, 22, 35), vertical=True)
    draw = ImageDraw.Draw(base)

    # Green glow at center (trust/guarantee feel)
    cx, cy = W // 2, H // 2
    for r in range(300, 0, -6):
        t = r / 300
        g = int(60 * (1 - t))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r),
                     fill=(0, g, int(g * 0.4)))

    # Shield outline (large, faint)
    shield_pts = [
        (cx, cy - 180), (cx + 120, cy - 100),
        (cx + 120, cy + 50), (cx, cy + 160),
        (cx - 120, cy + 50), (cx - 120, cy - 100),
    ]
    for _ in range(3):
        draw.polygon(shield_pts, outline=(30, 60, 40))
        shield_pts = [(x * 0.85 + cx * 0.15, y * 0.85 + cy * 0.15) for x, y in shield_pts]

    base = base.filter(ImageFilter.GaussianBlur(3))
    base.save("backgrounds/11_garantie.jpg", quality=90)
    print("✓ 11_garantie.jpg")


# ── 12. FOOTER / CTA ──────────────────────────────────────────────────────
# Very dark elegant with subtle horizontal sweep
def footer_cta():
    base = make_gradient_fast((8, 8, 16), (18, 14, 32), vertical=True)
    draw = ImageDraw.Draw(base)

    # Horizontal light sweep bands
    for i in range(6):
        y_pos = H // 7 * i + random.randint(-30, 30)
        for offset in range(-2, 3):
            brightness = max(0, 25 - abs(offset) * 5)
            draw.line((0, y_pos + offset, W, y_pos + offset),
                      fill=(brightness, brightness - 3, brightness + 10))

    # Bottom gradient fade
    for y in range(H - 200, H):
        t = (y - (H - 200)) / 200
        brightness = int(8 + 6 * t)
        draw.line((0, y, W, y), fill=(brightness, brightness, brightness + 4))

    base = base.filter(ImageFilter.GaussianBlur(1.5))
    base.save("backgrounds/12_footer_cta.jpg", quality=90)
    print("✓ 12_footer_cta.jpg")


if __name__ == "__main__":
    import os
    os.makedirs("backgrounds", exist_ok=True)
    print("Generating section backgrounds...")
    hero()
    te_recunosti()
    problema_reala()
    cum_functioneaza()
    ce_este_inclus()
    ce_vei_aplica()
    ce_vei_observa()
    e_pentru_tine()
    bonusuri()
    despre_trainer()
    garantie()
    footer_cta()
    print("\nDone! All 12 backgrounds saved to ./backgrounds/")
