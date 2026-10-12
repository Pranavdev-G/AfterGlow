import math
import random
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw, ImageFilter

W, H = 800, 1200
img = Image.new("RGBA", (W, H), (8, 12, 10, 255))
draw = ImageDraw.Draw(img)

# 1. Background: Dark Latverian stormy atmosphere & castle silhouette
for y in range(H):
    factor = y / H
    r = int(6 + 12 * (1 - factor) + 15 * factor)
    g = int(14 + 20 * (1 - factor) + 25 * factor)
    b = int(10 + 15 * (1 - factor) + 18 * factor)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Atmospheric nebula / emerald aura glow
glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

# Draw central emerald magical pulse / fortress aura
for rad in range(350, 50, -10):
    alpha = int(45 * (1 - rad / 350))
    glow_draw.ellipse(
        [W // 2 - rad, H // 2 - 100 - rad, W // 2 + rad, H // 2 - 100 + rad],
        fill=(16, 120, 80, alpha),
    )
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(40))
img = Image.alpha_composite(img, glow_layer)

# Latverian Castle / Spire silhouettes in distance
spires = Image.new("RGBA", (W, H), (0, 0, 0, 0))
spire_draw = ImageDraw.Draw(spires)
spire_draw.polygon([(80, 750), (140, 380), (160, 380), (220, 750)], fill=(12, 22, 18, 200))
spire_draw.polygon([(180, 750), (240, 440), (250, 440), (310, 750)], fill=(14, 25, 20, 210))
spire_draw.polygon([(520, 750), (580, 420), (590, 420), (650, 750)], fill=(12, 22, 18, 200))
spire_draw.polygon([(620, 750), (670, 360), (690, 360), (740, 750)], fill=(10, 18, 15, 220))
spires = spires.filter(ImageFilter.GaussianBlur(4))
img = Image.alpha_composite(img, spires)

# 2. Doctor Doom Silhouette, Cape, and Hood
figure = Image.new("RGBA", (W, H), (0, 0, 0, 0))
fig_draw = ImageDraw.Draw(figure)

# Massive emerald/forest green hooded cloak & shoulders
cloak_poly = [
    (100, H), (140, 850), (220, 620), (260, 450), (310, 320),
    (360, 250), (400, 230), (440, 250), (490, 320), (540, 450),
    (580, 620), (660, 850), (700, H)
]
fig_draw.polygon(cloak_poly, fill=(15, 42, 28, 255))

# Shading folds on cloak
for i in range(12):
    x_offset = random.randint(-150, 150)
    fig_draw.line(
        [(W // 2 + x_offset, 500 + i * 40), (W // 2 + x_offset * 1.5, H)],
        fill=(8, 26, 18, 180),
        width=25
    )

# Hood inner shadow
fig_draw.ellipse([300, 290, 500, 560], fill=(5, 10, 8, 255))

# 3. Metallic Iron Mask
# Jaw and faceplate
mask_poly = [
    (340, 360), (370, 340), (430, 340), (460, 360),
    (475, 430), (465, 490), (440, 550), (400, 580),
    (360, 550), (335, 490), (325, 430)
]
fig_draw.polygon(mask_poly, fill=(140, 148, 150, 255))

# Steel texture & shading on mask
for step in range(30):
    val = int(80 + 70 * math.sin(step / 5.0))
    fig_draw.line([(340 + step * 4, 380), (340 + step * 4, 540)], fill=(val, val + 5, val + 10, 120), width=3)

# Rivets and cheek plates
fig_draw.polygon([(345, 420), (390, 440), (390, 490), (340, 480)], fill=(110, 118, 120, 255))
fig_draw.polygon([(455, 420), (410, 440), (410, 490), (460, 480)], fill=(90, 98, 100, 255))

# Mouth vent grille
for vy in range(515, 545, 6):
    fig_draw.line([(385, vy), (415, vy)], fill=(20, 25, 22, 255), width=3)

# Eye sockets - Menacing dark cutouts
fig_draw.polygon([(350, 420), (385, 425), (380, 440), (352, 435)], fill=(0, 0, 0, 255))
fig_draw.polygon([(415, 425), (450, 420), (448, 435), (420, 440)], fill=(0, 0, 0, 255))

# Glowing emerald eyes within mask
fig_draw.line([(356, 429), (378, 431)], fill=(40, 255, 140, 255), width=4)
fig_draw.line([(422, 431), (444, 429)], fill=(40, 255, 140, 255), width=4)

# Medallion / Cape clasp chain
fig_draw.circle((315, 610), 22, fill=(190, 150, 40, 255))
fig_draw.circle((485, 610), 22, fill=(170, 135, 35, 255))
fig_draw.line([(335, 615), (465, 615)], fill=(200, 165, 50, 255), width=6)

# Hood outer rim drape
fig_draw.arc([290, 270, 510, 540], start=160, end=380, fill=(35, 80, 52, 255), width=28)

img = Image.alpha_composite(img, figure)

# 4. Atmospheric lighting, magic sparks, and ember motes
effects = Image.new("RGBA", (W, H), (0, 0, 0, 0))
eff_draw = ImageDraw.Draw(effects)

# Eye glow bloom
eff_draw.ellipse([345, 415, 388, 445], fill=(30, 255, 120, 130))
eff_draw.ellipse([412, 415, 455, 445], fill=(30, 255, 120, 130))
effects = effects.filter(ImageFilter.GaussianBlur(8))
img = Image.alpha_composite(img, effects)

# Floating emerald & ember particles
particles = Image.new("RGBA", (W, H), (0, 0, 0, 0))
p_draw = ImageDraw.Draw(particles)
random.seed(42)
for _ in range(120):
    px = random.randint(50, W - 50)
    py = random.randint(200, H - 50)
    prad = random.randint(2, 6)
    col = (random.randint(40, 100), random.randint(180, 255), random.randint(100, 180), random.randint(120, 220)) if random.random() > 0.3 else (255, random.randint(140, 200), 50, random.randint(100, 180))
    p_draw.ellipse([px - prad, py - prad, px + prad, py + prad], fill=col)

particles = particles.filter(ImageFilter.GaussianBlur(2))
img = Image.alpha_composite(img, particles)

# Vignette
vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for edge in range(100):
    val = int(220 * (1 - edge / 100))
    v_draw.rectangle([edge, edge, W - edge, H - edge], outline=(0, 0, 0, 4), width=1)
img = Image.alpha_composite(img, vignette)

# Convert to RGB and save webp + jpg
final_rgb = img.convert("RGB")
final_rgb.save("frontend/public/posters/doctor-doom.webp", "WEBP", quality=90)
final_rgb.save("frontend/public/posters/doctor-doom.jpg", "JPEG", quality=90)
final_rgb.save(".assets/posters/doctor-doom.webp", "WEBP", quality=90)
print("Generated Doctor Doom concept artwork successfully.")
