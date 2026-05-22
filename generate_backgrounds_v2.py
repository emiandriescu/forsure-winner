#!/usr/bin/env python3
"""
Background images v2 — cinematic silhouettes + color grading + edge fades.
Sections alternate between: PHOTO-LIKE (silhouette + dramatic light) |
ABSTRACT (geometric) | MINIMAL (solid + texture) for visual rhythm.
"""

import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path

W, H = 1920, 1080
random.seed(7)
np.random.seed(7)
Path("backgrounds").mkdir(exist_ok=True)

# Universal dark edge color — all sections fade to this, so page scrolls seamlessly
EDGE = np.array([6, 6, 14], dtype=np.float32)


# ── CORE UTILITIES ─────────────────────────────────────────────────────────

def grad(c1, c2, vertical=True):
    arr = np.zeros((H, W, 3), dtype=np.float32)
    for i in range(3):
        v = np.linspace(c1[i], c2[i], H if vertical else W, dtype=np.float32)
        arr[:, :, i] = v[:, None] if vertical else v[None, :]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def to_arr(img):
    return np.array(img).astype(np.float32)


def to_img(arr):
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def edge_fade(img, top=280, bottom=280, left=200, right=200):
    """Fade all edges to EDGE color so sections blend seamlessly."""
    a = to_arr(img)
    ys = np.arange(H, dtype=np.float32)
    xs = np.arange(W, dtype=np.float32)

    # Per-pixel blend factor: 0=fully EDGE, 1=fully image
    alpha = np.ones((H, W), dtype=np.float32)
    if top > 0:
        t = np.clip(ys / top, 0, 1)
        alpha *= t[:, None] ** 1.8
    if bottom > 0:
        b = np.clip((H - 1 - ys) / bottom, 0, 1)
        alpha *= b[:, None] ** 1.8
    if left > 0:
        l = np.clip(xs / left, 0, 1)
        alpha *= l[None, :] ** 1.8
    if right > 0:
        r = np.clip((W - 1 - xs) / right, 0, 1)
        alpha *= r[None, :] ** 1.8

    alpha = alpha[:, :, None]
    blended = a * alpha + EDGE[None, None, :] * (1 - alpha)
    return to_img(blended)


def vignette(arr, strength=0.9, color=EDGE):
    ys = (np.linspace(-1, 1, H) ** 2)[:, None]
    xs = (np.linspace(-1, 1, W) ** 2)[None, :]
    dist = np.sqrt(ys + xs)
    dist_norm = (dist / dist.max()) ** 1.4 * strength
    dist_norm = dist_norm[:, :, None]
    arr = arr * (1 - dist_norm) + color[None, None, :] * dist_norm
    return arr


def spotlight(arr, cx, cy, radius, intensity, color=(255, 240, 200)):
    """Add a soft elliptical spotlight."""
    ys = np.arange(H, dtype=np.float32)
    xs = np.arange(W, dtype=np.float32)
    X, Y = np.meshgrid(xs, ys)
    dist = np.sqrt(((X - cx) / (radius * 1.3)) ** 2 + ((Y - cy) / radius) ** 2)
    glow = np.clip(1 - dist / 1.8, 0, 1) ** 2.5 * intensity
    c = np.array(color, dtype=np.float32)
    for i in range(3):
        arr[:, :, i] = arr[:, :, i] + glow * (c[i] - arr[:, :, i]) * 0.55
    return arr


def top_beam(arr, cx, spread_deg, reach, color=(255, 230, 180), strength=0.7):
    """Dramatic cone of light from top of frame downward."""
    spread = math.radians(spread_deg)
    ys = np.arange(H, dtype=np.float32)
    xs = np.arange(W, dtype=np.float32)
    X, Y = np.meshgrid(xs, ys)
    angle = np.abs(np.arctan2(X - cx, Y + 1))
    in_cone = angle < spread
    falloff = np.clip(1 - ys / reach, 0, 1)[:, None] ** 1.6
    intensity = in_cone.astype(np.float32) * falloff * strength
    c = np.array(color, dtype=np.float32)
    for i in range(3):
        arr[:, :, i] = np.clip(arr[:, :, i] + intensity * c[i] * 0.35, 0, 255)
    return arr


def perlin_like_noise(scale=80, octaves=4, seed=0):
    """Fast pseudo-Perlin noise."""
    rng = np.random.RandomState(seed)
    out = np.zeros((H, W), dtype=np.float32)
    amp = 1.0
    for _ in range(octaves):
        nh, nw = max(1, H // scale), max(1, W // scale)
        small = rng.uniform(-1, 1, (nh, nw)).astype(np.float32)
        big = np.array(Image.fromarray(((small + 1) / 2 * 255).astype(np.uint8)).resize(
            (W, H), Image.BILINEAR)).astype(np.float32) / 127.5 - 1
        out += big * amp
        amp *= 0.5
        scale = max(4, scale // 2)
    return (out - out.min()) / (out.max() - out.min() + 1e-8)


# ── SILHOUETTE HELPERS ──────────────────────────────────────────────────────

def bb(x0, y0, x1, y1):
    """Ensure bounding box has min first (PIL requirement)."""
    return [min(x0,x1), min(y0,y1), max(x0,x1), max(y0,y1)]


def draw_figure_hunched(draw, cx, base_y, scale=1.0, fill=(5, 5, 10)):
    """Seated person, hunched forward — isolation / depression pose."""
    s = scale
    # Chair seat
    draw.rectangle(bb(cx - 80*s, base_y - 10, cx + 80*s, base_y + 15), fill=fill)
    # Chair legs
    draw.rectangle(bb(cx - 80*s, base_y - 160*s, cx - 60*s, base_y + 15), fill=fill)
    draw.rectangle(bb(cx + 60*s, base_y - 160*s, cx + 80*s, base_y + 15), fill=fill)
    # Person legs
    draw.polygon([
        (cx - 70*s, base_y - 10), (cx - 15*s, base_y - 10),
        (cx - 15*s, base_y - 140*s), (cx - 70*s, base_y - 130*s)
    ], fill=fill)
    draw.polygon([
        (cx + 70*s, base_y - 10), (cx + 15*s, base_y - 10),
        (cx + 15*s, base_y - 140*s), (cx + 70*s, base_y - 130*s)
    ], fill=fill)
    # Torso — hunched/curved forward
    draw.polygon([
        (cx - 65*s, base_y - 140*s), (cx + 65*s, base_y - 140*s),
        (cx + 55*s, base_y - 310*s), (cx + 20*s, base_y - 330*s),
        (cx - 20*s, base_y - 330*s), (cx - 55*s, base_y - 310*s),
    ], fill=fill)
    # Head — bowed forward-down
    hx = cx + 35*s
    hy = base_y - 380*s
    r = 52*s
    draw.ellipse(bb(hx - r, hy - r, hx + r, hy + r), fill=fill)
    # Arms — elbows on knees
    draw.polygon([
        (cx - 55*s, base_y - 270*s), (cx - 75*s, base_y - 130*s),
        (cx - 30*s, base_y - 130*s), (cx - 20*s, base_y - 270*s)
    ], fill=fill)
    draw.polygon([
        (cx + 55*s, base_y - 270*s), (cx + 75*s, base_y - 130*s),
        (cx + 30*s, base_y - 130*s), (cx + 20*s, base_y - 270*s)
    ], fill=fill)
    # Hands on face
    draw.ellipse(bb(hx - 25*s, hy + 15*s, hx + 25*s, hy + 65*s), fill=fill)


def draw_figure_standing_up(draw, cx, base_y, scale=1.0, fill=(5, 5, 10)):
    """Standing person, head up, arms wide — triumph / aspiration pose."""
    s = scale
    # Legs
    draw.polygon([
        (cx - 55*s, base_y), (cx - 10*s, base_y),
        (cx - 10*s, base_y - 230*s), (cx - 55*s, base_y - 210*s)
    ], fill=fill)
    draw.polygon([
        (cx + 55*s, base_y), (cx + 10*s, base_y),
        (cx + 10*s, base_y - 230*s), (cx + 55*s, base_y - 210*s)
    ], fill=fill)
    # Torso — upright, broad
    draw.polygon([
        (cx - 70*s, base_y - 210*s), (cx + 70*s, base_y - 210*s),
        (cx + 55*s, base_y - 400*s), (cx - 55*s, base_y - 400*s)
    ], fill=fill)
    # Head — slightly back (looking up)
    hx, hy = cx - 18*s, base_y - 460*s
    r = 55*s
    draw.ellipse([hx - r, hy - r, hx + r, hy + r], fill=fill)
    # Arms spread wide
    draw.polygon([
        (cx - 55*s, base_y - 370*s), (cx - 55*s, base_y - 310*s),
        (cx - 230*s, base_y - 230*s), (cx - 240*s, base_y - 290*s)
    ], fill=fill)
    draw.polygon([
        (cx + 55*s, base_y - 370*s), (cx + 55*s, base_y - 310*s),
        (cx + 230*s, base_y - 230*s), (cx + 240*s, base_y - 290*s)
    ], fill=fill)


def draw_figure_speaker(draw, cx, base_y, scale=1.0, fill=(5, 5, 10)):
    """Standing speaker — slightly forward, one arm extended."""
    s = scale
    # Legs
    draw.polygon([
        (cx - 45*s, base_y), (cx - 5*s, base_y),
        (cx - 5*s, base_y - 220*s), (cx - 45*s, base_y - 200*s)
    ], fill=fill)
    draw.polygon([
        (cx + 45*s, base_y), (cx + 5*s, base_y),
        (cx + 5*s, base_y - 220*s), (cx + 45*s, base_y - 200*s)
    ], fill=fill)
    # Torso
    draw.polygon([
        (cx - 65*s, base_y - 200*s), (cx + 65*s, base_y - 200*s),
        (cx + 50*s, base_y - 390*s), (cx - 50*s, base_y - 390*s)
    ], fill=fill)
    # Head
    r = 50*s
    draw.ellipse([cx - r, base_y - 450*s - r, cx + r, base_y - 450*s + r], fill=fill)
    # Right arm extended forward
    draw.polygon([
        (cx + 50*s, base_y - 360*s), (cx + 50*s, base_y - 300*s),
        (cx + 200*s, base_y - 270*s), (cx + 210*s, base_y - 330*s)
    ], fill=fill)
    # Left arm down
    draw.polygon([
        (cx - 50*s, base_y - 360*s), (cx - 50*s, base_y - 300*s),
        (cx - 80*s, base_y - 200*s), (cx - 90*s, base_y - 260*s)
    ], fill=fill)


def draw_figure_silhouette_backlit(draw, cx, base_y, scale=1.0, fill=(5, 5, 10)):
    """Person standing against light, looking into the horizon."""
    s = scale
    draw.polygon([
        (cx - 30*s, base_y), (cx + 30*s, base_y),
        (cx + 25*s, base_y - 230*s), (cx - 25*s, base_y - 230*s)
    ], fill=fill)
    draw.polygon([
        (cx - 30*s, base_y), (cx - 55*s, base_y),
        (cx - 45*s, base_y - 230*s), (cx - 20*s, base_y - 230*s)
    ], fill=fill)
    draw.polygon([
        (cx + 30*s, base_y), (cx + 55*s, base_y),
        (cx + 45*s, base_y - 230*s), (cx + 20*s, base_y - 230*s)
    ], fill=fill)
    draw.polygon([
        (cx - 70*s, base_y - 230*s), (cx + 70*s, base_y - 230*s),
        (cx + 55*s, base_y - 410*s), (cx - 55*s, base_y - 410*s)
    ], fill=fill)
    r = 52*s
    hy = base_y - 470*s
    draw.ellipse([cx - r, hy - r, cx + r, hy + r], fill=fill)
    draw.polygon([
        (cx - 55*s, base_y - 380*s), (cx - 200*s, base_y - 260*s),
        (cx - 210*s, base_y - 320*s), (cx - 60*s, base_y - 380*s)
    ], fill=fill)
    draw.polygon([
        (cx + 55*s, base_y - 380*s), (cx + 200*s, base_y - 260*s),
        (cx + 210*s, base_y - 320*s), (cx + 60*s, base_y - 380*s)
    ], fill=fill)


# ═══════════════════════════════════════════════════════════════════════════
# SECTION GENERATORS
# ═══════════════════════════════════════════════════════════════════════════

def s01_hero():
    """
    ABSTRACT — Deep indigo-purple, particle field, volumetric light from center-top.
    Mysterious, premium, draws the eye inward.
    """
    arr = to_arr(grad((8, 6, 20), (18, 12, 40), vertical=True))

    # Background noise texture
    noise = perlin_like_noise(scale=120, octaves=3, seed=1)
    arr += noise[:, :, None] * 12

    # Particle field — scattered light points
    for _ in range(220):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        sz = random.choice([1, 1, 1, 2, 2, 3])
        bright = random.uniform(60, 180)
        r_sq = (x - W*0.42)**2 / (W*0.6)**2 + (y - H*0.5)**2 / (H*0.6)**2
        falloff = max(0.2, 1 - r_sq)
        arr[max(0,y-sz):y+sz+1, max(0,x-sz):x+sz+1] += bright * falloff

    # Volumetric light from top-center
    cx = int(W * 0.42)
    arr = top_beam(arr, cx, spread_deg=18, reach=H * 1.2,
                   color=(140, 110, 220), strength=0.55)
    arr = top_beam(arr, cx, spread_deg=6, reach=H * 0.9,
                   color=(180, 150, 255), strength=0.4)

    # Radial glow at source
    ys = np.arange(H, dtype=np.float32)
    xs = np.arange(W, dtype=np.float32)
    X, Y = np.meshgrid(xs, ys)
    dist = np.sqrt((X - cx)**2 + Y**2)
    glow = np.clip(1 - dist / 500, 0, 1) ** 2.5
    arr[:, :, 2] += glow * 80
    arr[:, :, 0] += glow * 40

    arr = vignette(arr, strength=1.0)
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.2))
    return edge_fade(img, top=180, bottom=180, left=0, right=0)


def s02_te_recunosti():
    """
    SILHOUETTE — Person hunched at desk under single lamp.
    Cold blue shadows, isolation, recognition of a stuck feeling.
    """
    # Deep cold background, slightly lighter at center
    arr = to_arr(grad((6, 8, 18), (10, 14, 28), vertical=True))
    noise = perlin_like_noise(scale=200, octaves=2, seed=2)
    arr += noise[:, :, None] * 6

    # Ambient dim horizontal bands (like light through blinds)
    for i in range(8):
        y_pos = int(H * 0.15 + i * H * 0.08)
        brightness = random.uniform(2, 8)
        y0, y1 = max(0, y_pos - 4), min(H, y_pos + 4)
        arr[y0:y1, :, 0] += brightness * 0.5
        arr[y0:y1, :, 1] += brightness * 0.7
        arr[y0:y1, :, 2] += brightness

    # Desk lamp spotlight — warm amber, from above-right, smaller radius
    arr = spotlight(arr, cx=W * 0.55, cy=H * 0.28, radius=180,
                    intensity=0.75, color=(200, 170, 100))
    arr = spotlight(arr, cx=W * 0.55, cy=H * 0.28, radius=80,
                    intensity=0.5, color=(255, 220, 140))

    # Desk surface glow (reflected light on table)
    arr = spotlight(arr, cx=W * 0.55, cy=H * 0.74, radius=160,
                    intensity=0.3, color=(180, 155, 90))

    # Draw hunched figure
    fig = to_img(arr)
    draw = ImageDraw.Draw(fig)
    draw_figure_hunched(draw, W // 2 - 60, H - 140, scale=1.1, fill=(4, 5, 12))
    # Desk
    draw.rectangle([W // 2 - 320, H - 175, W // 2 + 320, H - 145], fill=(8, 9, 18))
    arr = to_arr(fig)

    # Cold blue side light (rim light from left, slight blue)
    arr = spotlight(arr, cx=W * 0.25, cy=H * 0.5, radius=350,
                    intensity=0.2, color=(60, 80, 160))

    arr = vignette(arr, strength=1.0)
    # Final color push — desaturate midtones slightly
    grey = arr.mean(axis=2, keepdims=True)
    arr = arr * 0.7 + grey * 0.3
    # Cold tint
    arr[:, :, 2] = np.clip(arr[:, :, 2] + 8, 0, 255)

    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.5))
    return edge_fade(img, top=300, bottom=200, left=250, right=250)


def s03_problema_reala():
    """
    SILHOUETTE — Single harsh overhead spotlight on hunched person.
    Deep crimson dark, oppressive. Shows the PROBLEM state.
    """
    arr = to_arr(grad((10, 4, 6), (16, 6, 10), vertical=False))
    noise = perlin_like_noise(scale=100, octaves=3, seed=3)
    arr += noise[:, :, None] * 8

    # Harsh overhead spot — much narrower, harder
    cx_fig = W // 2 + 40
    arr = spotlight(arr, cx=cx_fig, cy=-60, radius=260,
                    intensity=0.85, color=(220, 190, 150))
    arr = spotlight(arr, cx=cx_fig, cy=-60, radius=100,
                    intensity=0.6, color=(255, 230, 190))

    # Subtle red ambient around edges
    arr[:, :, 0] = np.clip(arr[:, :, 0] + 12, 0, 255)

    # Hunched figure
    fig = to_img(arr)
    draw = ImageDraw.Draw(fig)
    draw_figure_hunched(draw, cx_fig, H - 160, scale=1.15, fill=(5, 3, 5))
    arr = to_arr(fig)

    # Shadow cast forward on ground
    for i in range(60):
        t = i / 60
        shadow_x0 = int(cx_fig - 80 + t * 150)
        shadow_y = int(H - 160 - t * 20)
        alpha = (1 - t) * 0.4
        arr[shadow_y:shadow_y+12, max(0, shadow_x0):min(W, shadow_x0+80), :] *= (1 - alpha * 0.5)

    arr = vignette(arr, strength=1.1, color=np.array([10, 3, 5], dtype=np.float32))

    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.8))
    return edge_fade(img, top=260, bottom=260, left=300, right=300)


def s04_cum_functioneaza():
    """
    ABSTRACT — Three luminous columns on dark teal — structured, clear, LIGHTER than neighbors.
    The visual breathing point of the page (contrast section).
    """
    arr = to_arr(grad((8, 14, 22), (12, 20, 32), vertical=True))

    # 3 glowing columns
    col_xs = [W // 4, W // 2, 3 * W // 4]
    col_colors = [(60, 140, 200), (80, 160, 220), (50, 120, 180)]
    for cx, cc in zip(col_xs, col_colors):
        for r in range(320, 0, -4):
            t = r / 320
            intensity = (1 - t**1.5) * 0.12
            xs = np.arange(W)
            ys = np.arange(H)
            X, Y = np.meshgrid(xs, ys)
            dist = np.sqrt(((X - cx) / 1.8)**2 + (Y - H // 2)**2)
            mask = dist < r
            for i in range(3):
                arr[:, :, i][mask] = np.clip(
                    arr[:, :, i][mask] + cc[i] * intensity, 0, 255)

    # Horizontal connection lines between columns
    for y in range(int(H * 0.3), int(H * 0.7), 40):
        brightness = random.uniform(20, 50)
        arr[y:y+1, :, :] += brightness * 0.15
        arr[y:y+1, :, 2] += brightness * 0.3

    # Vertical accent lines at column centers
    for cx in col_xs:
        arr[:, cx-1:cx+1, 0] = np.clip(arr[:, cx-1:cx+1, 0] + 20, 0, 255)
        arr[:, cx-1:cx+1, 1] = np.clip(arr[:, cx-1:cx+1, 1] + 40, 0, 255)
        arr[:, cx-1:cx+1, 2] = np.clip(arr[:, cx-1:cx+1, 2] + 60, 0, 255)

    arr = vignette(arr, strength=0.7, color=EDGE)
    img = to_img(arr).filter(ImageFilter.GaussianBlur(2))
    return edge_fade(img, top=200, bottom=200, left=0, right=0)


def s05_ce_este_inclus():
    """
    MINIMAL — Pure dark with subtle audio-waveform texture + micro-noise.
    Visual rest. Lets the list content breathe.
    """
    arr = to_arr(grad((8, 8, 16), (10, 10, 20), vertical=False))
    noise = perlin_like_noise(scale=60, octaves=4, seed=5)
    arr += noise[:, :, None] * 5

    # Subtle waveform lines (audio / sound metaphor)
    for i in range(30):
        y_base = random.randint(80, H - 80)
        amp = random.randint(3, 12)
        freq = random.uniform(0.004, 0.012)
        phase = random.uniform(0, math.pi * 2)
        xs = np.arange(W)
        ys = (y_base + amp * np.sin(freq * xs + phase)).astype(int)
        ys = np.clip(ys, 0, H - 1)
        brightness = random.uniform(8, 22)
        for x_i, y_i in zip(xs, ys):
            if 0 <= y_i < H:
                arr[y_i, x_i] += brightness * 0.6
                arr[y_i, x_i, 2] += brightness * 0.4

    arr = vignette(arr, strength=0.8)
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1))
    return edge_fade(img, top=150, bottom=150, left=0, right=0)


def s06_ce_vei_aplica():
    """
    ABSTRACT — Warm dark amber/brown, hexagonal grid + subtle depth.
    Suggests structure, practice, tangible exercises.
    """
    arr = to_arr(grad((12, 8, 6), (18, 12, 8), vertical=True))
    noise = perlin_like_noise(scale=80, octaves=3, seed=6)
    arr += noise[:, :, None] * 10

    # Hex grid (muted, very subtle)
    HEX_R = 56
    for row in range(int(H / (HEX_R * 1.73)) + 3):
        for col in range(int(W / (HEX_R * 2)) + 3):
            cx_h = col * HEX_R * 2 + (HEX_R if row % 2 else 0)
            cy_h = row * int(HEX_R * 1.73)
            pts = [(int(cx_h + HEX_R * math.cos(math.radians(60*i - 30))),
                    int(cy_h + HEX_R * math.sin(math.radians(60*i - 30)))) for i in range(6)]
            b = random.uniform(22, 38)
            # Draw edges manually for efficiency
            for p in range(6):
                x1, y1 = pts[p]
                x2, y2 = pts[(p+1) % 6]
                # Line between points (simplified)
                steps = max(abs(x2-x1), abs(y2-y1), 1)
                for s_i in range(steps):
                    xi = int(x1 + (x2-x1)*s_i/steps)
                    yi = int(y1 + (y2-y1)*s_i/steps)
                    if 0 <= xi < W and 0 <= yi < H:
                        arr[yi, xi, 0] += b
                        arr[yi, xi, 1] += b * 0.7
                        arr[yi, xi, 2] += b * 0.5

    arr = vignette(arr, strength=0.9)
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.5))
    return edge_fade(img, top=200, bottom=200, left=0, right=0)


def s07_ce_vei_observa():
    """
    SILHOUETTE — Person with arms raised wide, bathed in golden upward light.
    The emotional PEAK — transformation, hope, aspiration.
    Warm gold, maximum contrast with sections 02-03.
    """
    arr = to_arr(grad((10, 8, 4), (20, 14, 6), vertical=True))

    # Bottom-to-top golden glow (light rising — aspiration metaphor)
    ys = np.linspace(1, 0, H) ** 1.8
    arr[:, :, 0] += ys[:, None] * 60
    arr[:, :, 1] += ys[:, None] * 35
    arr[:, :, 2] += ys[:, None] * 10

    # Multiple warm light sources from below and sides
    arr = spotlight(arr, cx=W * 0.5, cy=H * 1.1, radius=600,
                    intensity=0.7, color=(255, 200, 80))
    arr = spotlight(arr, cx=W * 0.5, cy=H * 1.1, radius=280,
                    intensity=0.5, color=(255, 220, 120))

    # Rays from bottom-center
    arr = top_beam(arr, W // 2, spread_deg=25, reach=H,
                   color=(255, 200, 100), strength=0.4)
    # Invert beam (from bottom) by flipping
    arr_flipped = arr[::-1, :, :]
    arr_flipped = top_beam(arr_flipped, W // 2, spread_deg=20, reach=H,
                           color=(255, 180, 60), strength=0.45)
    arr = arr_flipped[::-1, :, :]

    # Triumphant figure
    fig = to_img(arr)
    draw = ImageDraw.Draw(fig)
    draw_figure_standing_up(draw, W // 2, H - 80, scale=1.0, fill=(8, 6, 4))
    arr = to_arr(fig)

    # Noise texture
    noise = perlin_like_noise(scale=150, octaves=2, seed=7)
    arr += noise[:, :, None] * 8

    arr = vignette(arr, strength=0.95, color=np.array([6, 5, 3], dtype=np.float32))

    # Golden color grade: boost reds/yellows in brighter areas
    bright = arr.mean(axis=2, keepdims=True) / 255
    arr[:, :, 0] = np.clip(arr[:, :, 0] + bright[:, :, 0] * 30, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.8, 0, 255)

    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.6))
    return edge_fade(img, top=280, bottom=200, left=280, right=280)


def s08_e_pentru_tine():
    """
    ABSTRACT — Diagonal split design with contrasting dark panels.
    Structural, decision-point section.
    """
    arr = np.zeros((H, W, 3), dtype=np.float32)

    # Left panel: cold dark navy
    for x in range(W):
        t = x / W
        c = np.array([6 + 4*t, 8 + 6*t, 18 + 8*t], dtype=np.float32)
        arr[:, x] = c

    # Diagonal separator: mask right of diagonal
    for y in range(H):
        x_split = int(W * 0.48 + (y / H) * W * 0.12)
        x_split = min(x_split, W - 1)
        # Right panel: slightly warmer dark
        t_y = y / H
        c_right = np.array([10 + 6*t_y, 8 + 4*t_y, 14 + 4*t_y], dtype=np.float32)
        arr[y, x_split:] = c_right

        # Diagonal glow edge (blur-like)
        for edge_x in range(max(0, x_split - 60), min(W, x_split + 60)):
            t_edge = abs(edge_x - x_split) / 60
            glow = (1 - t_edge**2) * 35
            arr[y, edge_x, 0] += glow * 0.6
            arr[y, edge_x, 1] += glow * 0.4
            arr[y, edge_x, 2] += glow * 0.8

    noise = perlin_like_noise(scale=100, octaves=2, seed=8)
    arr += noise[:, :, None] * 6
    arr = vignette(arr, strength=0.8)
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1))
    return edge_fade(img, top=200, bottom=200, left=0, right=0)


def s09_bonusuri():
    """
    MINIMAL-RICH — Deep purple with sparkle particles and warm center glow.
    Premium, rewarding feeling.
    """
    arr = to_arr(grad((8, 6, 20), (14, 8, 30), vertical=True))

    # Warm center glow
    arr = spotlight(arr, cx=W * 0.5, cy=H * 0.5, radius=400,
                    intensity=0.4, color=(200, 150, 100))

    # Star particles
    for _ in range(180):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        sz = random.choice([0, 0, 0, 1, 1, 2])
        bright = random.uniform(80, 220)
        color_mult = np.array([1.0, 0.85, 1.2])
        y0, y1 = max(0, y-sz), min(H, y+sz+1)
        x0, x1 = max(0, x-sz), min(W, x+sz+1)
        arr[y0:y1, x0:x1] = np.clip(arr[y0:y1, x0:x1] + bright * color_mult, 0, 255)

    # Star cross shapes (larger sparkles)
    for _ in range(25):
        x = random.randint(50, W - 50)
        y = random.randint(50, H - 50)
        length = random.randint(8, 22)
        bright = random.uniform(120, 200)
        for dx in range(-length, length + 1):
            xi = x + dx
            if 0 <= xi < W:
                t = 1 - abs(dx) / length
                arr[y, xi] = np.clip(arr[y, xi] + bright * t * np.array([1.0, 0.8, 1.3]), 0, 255)
        for dy in range(-length, length + 1):
            yi = y + dy
            if 0 <= yi < H:
                t = 1 - abs(dy) / length
                arr[yi, x] = np.clip(arr[yi, x] + bright * t * np.array([1.0, 0.8, 1.3]), 0, 255)

    arr = vignette(arr, strength=0.9, color=np.array([6, 5, 16], dtype=np.float32))
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1))
    return edge_fade(img, top=200, bottom=200, left=0, right=0)


def s10_despre_trainer():
    """
    SILHOUETTE — Speaker on stage, warm spotlight from above-front.
    Professional, warm, trustworthy. High-key lighting.
    """
    arr = to_arr(grad((10, 8, 8), (18, 14, 10), vertical=False))
    noise = perlin_like_noise(scale=180, octaves=2, seed=10)
    arr += noise[:, :, None] * 10

    # Main warm spotlight from above (stage light)
    cx_stage = int(W * 0.4)
    arr = spotlight(arr, cx=cx_stage, cy=-40, radius=380,
                    intensity=0.8, color=(255, 220, 160))
    arr = spotlight(arr, cx=cx_stage, cy=-40, radius=160,
                    intensity=0.5, color=(255, 240, 200))

    # Warm fill from left (side light)
    arr = spotlight(arr, cx=W * 0.05, cy=H * 0.5, radius=500,
                    intensity=0.25, color=(200, 160, 100))

    # Stage bokeh — soft circles in background right
    for _ in range(18):
        bx = random.randint(W // 2, W - 50)
        by = random.randint(50, H - 50)
        br = random.randint(20, 60)
        bc = random.uniform(30, 70)
        ys = np.arange(H)
        xs = np.arange(W)
        X, Y = np.meshgrid(xs, ys)
        dist_b = np.sqrt((X - bx)**2 + (Y - by)**2)
        mask_b = dist_b < br
        fade_b = np.clip(1 - dist_b[mask_b] / br, 0, 1)
        arr[:, :, 0][mask_b] = np.clip(arr[:, :, 0][mask_b] + fade_b * bc * 1.2, 0, 255)
        arr[:, :, 1][mask_b] = np.clip(arr[:, :, 1][mask_b] + fade_b * bc * 0.9, 0, 255)
        arr[:, :, 2][mask_b] = np.clip(arr[:, :, 2][mask_b] + fade_b * bc * 0.5, 0, 255)

    # Speaker silhouette
    fig = to_img(arr)
    draw = ImageDraw.Draw(fig)
    draw_figure_speaker(draw, cx_stage, H - 100, scale=1.05, fill=(6, 5, 4))
    arr = to_arr(fig)

    # Warm color grade
    arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.08 + 10, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.82, 0, 255)

    arr = vignette(arr, strength=0.9, color=np.array([7, 5, 4], dtype=np.float32))
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.5))
    return edge_fade(img, top=280, bottom=200, left=280, right=280)


def s11_garantie():
    """
    ABSTRACT — Deep green-tinted dark with subtle shield and trust geometry.
    Clean, professional, secure.
    """
    arr = to_arr(grad((6, 10, 8), (10, 16, 12), vertical=True))
    noise = perlin_like_noise(scale=120, octaves=3, seed=11)
    arr += noise[:, :, None] * 7

    # Soft green center glow
    arr = spotlight(arr, cx=W * 0.5, cy=H * 0.5, radius=450,
                    intensity=0.45, color=(40, 180, 100))
    arr = spotlight(arr, cx=W * 0.5, cy=H * 0.5, radius=200,
                    intensity=0.25, color=(60, 220, 120))

    # Concentric circle geometry (security/trust)
    cx_c, cy_c = W // 2, H // 2
    for r in range(50, 450, 55):
        ys = np.arange(H)
        xs = np.arange(W)
        X, Y = np.meshgrid(xs, ys)
        dist_c = np.sqrt((X - cx_c)**2 + (Y - cy_c)**2)
        ring = (np.abs(dist_c - r) < 1.5).astype(np.float32)
        brightness = 18 - r / 35
        arr[:, :, 1] += ring * brightness

    arr = vignette(arr, strength=0.9, color=np.array([5, 8, 6], dtype=np.float32))
    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.5))
    return edge_fade(img, top=180, bottom=180, left=0, right=0)


def s12_footer_cta():
    """
    SILHOUETTE — Person standing against a powerful light source, arms open.
    THE climax: breakthrough, transformation, decision.
    Dark-to-light, most dramatic image on the page.
    """
    # Start very dark, light from behind/above
    arr = to_arr(grad((4, 4, 10), (8, 6, 16), vertical=True))

    # Central explosion of light from behind the figure
    cx_f = W // 2
    cy_light = int(H * 0.28)
    arr = spotlight(arr, cx=cx_f, cy=cy_light, radius=700,
                    intensity=0.9, color=(180, 140, 255))
    arr = spotlight(arr, cx=cx_f, cy=cy_light, radius=380,
                    intensity=0.75, color=(220, 180, 255))
    arr = spotlight(arr, cx=cx_f, cy=cy_light, radius=160,
                    intensity=0.6, color=(255, 230, 255))

    # Rays
    arr = top_beam(arr, cx_f, spread_deg=30, reach=H,
                   color=(200, 160, 255), strength=0.5)
    arr = top_beam(arr, cx_f, spread_deg=10, reach=H,
                   color=(240, 200, 255), strength=0.4)

    # Particle halo around light source
    rng = np.random.RandomState(12)
    for _ in range(300):
        angle = rng.uniform(0, math.pi * 2)
        dist_p = rng.uniform(80, 550)
        px = int(cx_f + dist_p * math.cos(angle))
        py = int(cy_light + dist_p * math.sin(angle) * 0.6)
        if 0 <= px < W and 0 <= py < H:
            sz = rng.choice([0, 0, 1, 1, 2])
            bright = rng.uniform(40, 150) * max(0, 1 - dist_p / 500)
            y0, y1 = max(0, py-sz), min(H, py+sz+1)
            x0, x1 = max(0, px-sz), min(W, px+sz+1)
            arr[y0:y1, x0:x1, 0] += bright * 0.9
            arr[y0:y1, x0:x1, 1] += bright * 0.7
            arr[y0:y1, x0:x1, 2] += bright

    # Backlit figure — appears as dark silhouette against the light
    fig = to_img(arr)
    draw = ImageDraw.Draw(fig)
    draw_figure_silhouette_backlit(draw, cx_f, H - 80, scale=1.1, fill=(4, 3, 8))
    arr = to_arr(fig)

    arr = vignette(arr, strength=1.0, color=np.array([3, 3, 8], dtype=np.float32))

    # Purple-violet color grade
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 1.1 + 5, 0, 255)

    img = to_img(arr).filter(ImageFilter.GaussianBlur(1.8))
    return edge_fade(img, top=250, bottom=220, left=300, right=300)


# ── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    print("Generating v2 backgrounds (this may take ~2 min)...")
    sections = [
        ("01_hero",               s01_hero,              "Abstract — Indigo particle field + beam"),
        ("02_te_recunosti",       s02_te_recunosti,      "Silhouette — Hunched at desk, cold lamp"),
        ("03_problema_reala",     s03_problema_reala,    "Silhouette — Harsh overhead light, crimson"),
        ("04_cum_functioneaza",   s04_cum_functioneaza,  "Abstract — 3 teal columns, contrast section"),
        ("05_ce_este_inclus",     s05_ce_este_inclus,    "Minimal — Dark + audio waveforms"),
        ("06_ce_vei_aplica",      s06_ce_vei_aplica,     "Abstract — Amber hex grid"),
        ("07_ce_vei_observa",     s07_ce_vei_observa,    "Silhouette — Triumph, arms wide, golden light"),
        ("08_e_pentru_tine",      s08_e_pentru_tine,     "Abstract — Diagonal split panels"),
        ("09_bonusuri",           s09_bonusuri,          "Minimal-rich — Purple + sparkles"),
        ("10_despre_trainer",     s10_despre_trainer,    "Silhouette — Speaker, warm stage light"),
        ("11_garantie",           s11_garantie,          "Abstract — Green concentric trust circles"),
        ("12_footer_cta",         s12_footer_cta,        "Silhouette — Backlit triumph, purple halo"),
    ]

    for filename, fn, desc in sections:
        sys.stdout.write(f"  {filename}... ")
        sys.stdout.flush()
        try:
            img = fn()
            out_path = f"backgrounds/{filename}.jpg"
            img.save(out_path, quality=92, optimize=True)
            print(f"✓  ({desc})")
        except Exception as e:
            print(f"✗ ERROR: {e}")

    print("\nDone! Saved to ./backgrounds/")
