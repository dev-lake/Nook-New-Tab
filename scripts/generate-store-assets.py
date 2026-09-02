#!/usr/bin/env python3
"""Build Chrome Web Store graphics from the approved Nook screenshots."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "store" / "assets"
SOURCE = ROOT / "docs" / "store" / "source"
OUTPUT = ROOT / "docs" / "store" / "generated"

FONT_REGULAR = "/System/Library/Fonts/SFNS.ttf"
FONT_ROUNDED = "/System/Library/Fonts/SFNSRounded.ttf"

# Detected browser-window bounds in the four 2560x1600 source captures.
# Cropping to these bounds removes the desktop surrounding the browser while
# preserving both the macOS window controls and the right-side browser menu.
WINDOW_BOUNDS = {
    "capture_01.png": (110, 88, 2442, 1496),
    "capture_02.png": (116, 100, 2448, 1509),
    "capture_03.png": (110, 94, 2442, 1502),
    "capture_04.png": (114, 82, 2446, 1490),
}


def font(size: int, rounded: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_ROUNDED if rounded else FONT_REGULAR, size=size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def browser_crop(source_name: str) -> Image.Image:
    image = Image.open(ASSETS / source_name).convert("RGB")
    return image.crop(WINDOW_BOUNDS[source_name])


def rounded(image: Image.Image, radius: int, border: int = 0) -> Image.Image:
    image = image.convert("RGBA")
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, image.width - 1, image.height - 1), radius=radius, fill=255
    )
    image.putalpha(mask)
    if border:
        stroke = Image.new("RGBA", image.size, (0, 0, 0, 0))
        ImageDraw.Draw(stroke).rounded_rectangle(
            (0, 0, image.width - 1, image.height - 1),
            radius=radius,
            outline=(255, 255, 255, 90),
            width=border,
        )
        image.alpha_composite(stroke)
    return image


def place_card(
    canvas: Image.Image,
    card: Image.Image,
    position: tuple[int, int],
    blur: int,
    offset: tuple[int, int],
    opacity: int,
) -> None:
    shadow = Image.new("RGBA", card.size, (0, 0, 0, opacity))
    alpha = card.getchannel("A")
    shadow.putalpha(alpha.point(lambda value: value * opacity // 255))
    shadow_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_layer.alpha_composite(
        shadow, (position[0] + offset[0], position[1] + offset[1])
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(shadow_layer)
    canvas.alpha_composite(card, position)


def tint_background(size: tuple[int, int], dark_left: bool = False) -> Image.Image:
    backdrop = Image.open(SOURCE / "nook-brand-backdrop.png").convert("RGB")
    backdrop = cover(backdrop, size)
    backdrop = Image.blend(backdrop, Image.new("RGB", size, "#4356D8"), 0.24).convert("RGBA")

    if dark_left:
        overlay = Image.new("RGBA", size, (0, 0, 0, 0))
        pixels = overlay.load()
        for x in range(size[0]):
            strength = max(0.0, 1.0 - x / (size[0] * 0.62))
            alpha = round(180 * strength)
            for y in range(size[1]):
                pixels[x, y] = (14, 20, 72, alpha)
        backdrop.alpha_composite(overlay)
    return backdrop


def build_small_promo() -> None:
    size = (440, 280)
    canvas = tint_background(size, dark_left=True)

    screenshot = Image.open(
        OUTPUT / "screenshot-01-bookmarks-and-shortcuts-1280x800.png"
    ).convert("RGB")
    # Keep the product surface as the single visual focus. The wide crop shows
    # search, greeting, and pinned shortcuts without the browser chrome.
    screenshot = screenshot.crop((300, 138, 1280, 743))
    screenshot = screenshot.resize((324, 200), Image.Resampling.LANCZOS)
    screenshot = screenshot.filter(
        ImageFilter.UnsharpMask(radius=0.7, percent=175, threshold=2)
    )
    screenshot_card = Image.new("RGB", (348, 200), "#EEF2F9")
    screenshot_card.paste(screenshot, (24, 0))
    screenshot = screenshot_card
    screenshot = rounded(screenshot, radius=16, border=2)
    place_card(canvas, screenshot, (72, 40), blur=13, offset=(4, 10), opacity=115)

    icon = Image.open(ROOT / "public" / "icon-128.png").convert("RGBA")
    icon = icon.resize((74, 74), Image.Resampling.LANCZOS)
    place_card(canvas, icon, (27, 103), blur=11, offset=(3, 8), opacity=120)

    canvas.convert("RGB").save(
        OUTPUT / "promo-small-440x280.png", format="PNG", optimize=True
    )


def build_marquee() -> None:
    size = (1400, 560)
    canvas = tint_background(size, dark_left=True)

    screenshot = Image.open(
        OUTPUT / "screenshot-01-bookmarks-and-shortcuts-1280x800.png"
    ).convert("RGB")
    screenshot = screenshot.resize((760, 475), Image.Resampling.LANCZOS)
    screenshot = rounded(screenshot, radius=27, border=2)
    place_card(canvas, screenshot, (620, 43), blur=24, offset=(8, 18), opacity=115)

    icon = Image.open(ROOT / "public" / "icon-128.png").convert("RGBA")
    icon = icon.resize((76, 76), Image.Resampling.LANCZOS)
    place_card(canvas, icon, (82, 68), blur=10, offset=(3, 8), opacity=100)

    draw = ImageDraw.Draw(canvas)
    draw.text((177, 77), "Nook", font=font(48, rounded=True), fill=(255, 255, 255, 255))
    draw.text((82, 190), "A calmer\nnew tab.", font=font(66, rounded=True), fill=(255, 255, 255, 255), spacing=2)
    draw.text(
        (84, 390),
        "Bookmarks  ·  Shortcuts  ·  Browser tools",
        font=font(24),
        fill=(224, 232, 255, 235),
    )
    draw.rounded_rectangle((82, 449, 258, 457), radius=4, fill=(151, 196, 255, 230))

    canvas.convert("RGB").save(
        OUTPUT / "promo-marquee-1400x560.png", format="PNG", optimize=True
    )


def build_screenshots() -> None:
    names = {
        "capture_01.png": "screenshot-01-bookmarks-and-shortcuts-1280x800.png",
        "capture_02.png": "screenshot-02-shortcut-groups-1280x800.png",
        "capture_03.png": "screenshot-03-dark-mode-1280x800.png",
        "capture_04.png": "screenshot-04-languages-1280x800.png",
    }
    for source_name, output_name in names.items():
        image = browser_crop(source_name)
        image = image.resize((1280, 800), Image.Resampling.LANCZOS)
        image.save(OUTPUT / output_name, format="PNG", optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build_screenshots()
    build_small_promo()
    build_marquee()


if __name__ == "__main__":
    main()
