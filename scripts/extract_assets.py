from __future__ import annotations

from collections import deque
from pathlib import Path
from shutil import copy2

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ROOT / "sections"
ASSETS = ROOT / "assets"
GENERATED = Path("/Users/tafi/.codex/generated_images/01a00fd4-a1ea-7043-81cd-3fee54a1c89b")


def ensure_dirs() -> None:
    for name in ("backgrounds", "brand", "illustrations", "methods", "programs", "blog"):
        (ASSETS / name).mkdir(parents=True, exist_ok=True)
    (ASSETS / "_source-crops" / "programs").mkdir(parents=True, exist_ok=True)


def save_webp(image: Image.Image, path: Path, quality: int = 92) -> None:
    image.convert("RGB").save(path, "WEBP", quality=quality, method=6)


def crop_circle(
    source: Path,
    box: tuple[int, int, int, int],
    output: Path,
    mask_inset: int = 2,
) -> None:
    image = Image.open(source).convert("RGBA").crop(box)
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    inset = mask_inset
    draw.ellipse((inset, inset, image.width - inset, image.height - inset), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    image.putalpha(mask)
    image.save(output, "PNG", optimize=True)


def crop_largest_subject(
    source: Path,
    box: tuple[int, int, int, int],
    output: Path,
    white_distance: int = 34,
) -> None:
    """Keep the largest non-white connected subject and remove adjacent card content."""
    image = Image.open(source).convert("RGBA").crop(box)
    width, height = image.size
    rgb = image.convert("RGB")
    pixels = rgb.load()

    candidate = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            red, green, blue = pixels[x, y]
            distance = max(255 - red, 255 - green, 255 - blue)
            if distance >= white_distance:
                candidate[y * width + x] = 1

    visited = bytearray(width * height)
    largest: list[int] = []
    neighbors = ((-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1))

    for start in range(width * height):
        if not candidate[start] or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        component: list[int] = []
        while queue:
            current = queue.popleft()
            component.append(current)
            cx = current % width
            cy = current // width
            for dx, dy in neighbors:
                nx, ny = cx + dx, cy + dy
                if nx < 0 or ny < 0 or nx >= width or ny >= height:
                    continue
                index = ny * width + nx
                if candidate[index] and not visited[index]:
                    visited[index] = 1
                    queue.append(index)
        if len(component) > len(largest):
            largest = component

    alpha_data = bytearray(width * height)
    for index in largest:
        alpha_data[index] = 255
    alpha = Image.frombytes("L", (width, height), bytes(alpha_data))

    # Fill bright line-art holes enclosed by the dark circular illustration.
    outside = bytearray(width * height)
    queue: deque[int] = deque()
    alpha_pixels = alpha.load()
    for x in range(width):
        for y in (0, height - 1):
            if alpha_pixels[x, y] == 0:
                index = y * width + x
                outside[index] = 1
                queue.append(index)
    for y in range(height):
        for x in (0, width - 1):
            if alpha_pixels[x, y] == 0:
                index = y * width + x
                if not outside[index]:
                    outside[index] = 1
                    queue.append(index)

    while queue:
        current = queue.popleft()
        cx = current % width
        cy = current // width
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = cx + dx, cy + dy
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            index = ny * width + nx
            if alpha_pixels[nx, ny] == 0 and not outside[index]:
                outside[index] = 1
                queue.append(index)

    filled = bytearray(width * height)
    for index in range(width * height):
        if alpha_data[index] or not outside[index]:
            filled[index] = 255
    alpha = Image.frombytes("L", (width, height), bytes(filled))
    alpha = alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    image.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox:
        image = add_padding(image.crop(bbox), 4)
    image.save(output, "PNG", optimize=True)


def white_to_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    white = Image.new("RGB", rgba.size, "white")
    distance = ImageChops.difference(rgba.convert("RGB"), white).convert("L")
    alpha = distance.point(lambda value: max(0, min(255, (value - 6) * 8)))
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def add_padding(image: Image.Image, padding: int = 8) -> Image.Image:
    canvas = Image.new("RGBA", (image.width + padding * 2, image.height + padding * 2), (0, 0, 0, 0))
    canvas.alpha_composite(image, (padding, padding))
    return canvas


def make_logos() -> None:
    source = Image.open(SECTIONS / "01-hero-tra-cuu-v2.png")
    logo_crop = source.crop((66, 32, 252, 105))
    dark_logo = add_padding(white_to_alpha(logo_crop), 6)
    dark_logo.save(ASSETS / "brand" / "sgen-logo-dark.png", "PNG", optimize=True)

    light_logo = dark_logo.copy()
    alpha = light_logo.getchannel("A")
    bright = ImageEnhance.Brightness(light_logo.convert("RGB")).enhance(1.35)
    veil = Image.new("RGB", light_logo.size, (224, 203, 255))
    bright = Image.blend(bright, veil, 0.42)
    light_logo = bright.convert("RGBA")
    light_logo.putalpha(alpha)
    light_logo.save(ASSETS / "brand" / "sgen-logo-light.png", "PNG", optimize=True)
    high_resolution_light_logo = light_logo.resize(
        (light_logo.width * 3, light_logo.height * 3),
        Image.Resampling.LANCZOS,
    ).filter(ImageFilter.UnsharpMask(radius=1.1, percent=115, threshold=2))
    high_resolution_light_logo.save(ASSETS / "brand" / "sgen-logo-light-hd.png", "PNG", optimize=True)

    footer_source = Image.open(SECTIONS / "08-tu-van-footer-v2.png").convert("RGBA")
    footer_crop = footer_source.crop((110, 684, 432, 801))
    footer_rgb = footer_crop.convert("RGB")
    footer_alpha = Image.new("L", footer_crop.size)
    source_pixels = footer_rgb.load()
    alpha_pixels = footer_alpha.load()
    for y in range(footer_crop.height):
        for x in range(footer_crop.width):
            red, green, blue = source_pixels[x, y]
            brightness = max(red, green, blue)
            alpha_pixels[x, y] = max(0, min(255, (brightness - 60) * 6))
    footer_crop.putalpha(footer_alpha)
    footer_bbox = footer_alpha.getbbox()
    if footer_bbox:
        footer_crop = add_padding(footer_crop.crop(footer_bbox), 5)
    footer_crop.save(ASSETS / "brand" / "sgen-logo-light-footer.png", "PNG", optimize=True)


def make_backgrounds_and_generated_illustrations() -> None:
    generated_assets = {
        "exec-83542804-8db5-4917-aed4-582a0f499908.png": ASSETS / "backgrounds" / "cosmic-dark.webp",
        "exec-70a8781e-bdc9-466b-a51d-34ed318e1ec7.png": ASSETS / "backgrounds" / "cosmic-dark-clean.webp",
        "exec-8dbc481f-fc41-4f0e-b706-b6fcee344f79.png": ASSETS / "backgrounds" / "cosmic-light.webp",
        "exec-c3de2beb-06e5-4e62-b3d0-1614fe4cc6b8.png": ASSETS / "illustrations" / "pythagoras-cosmic.png",
        "exec-429aa538-4163-46d3-8aaf-58ccad1e510f.png": ASSETS / "illustrations" / "numeral-1-cosmic.png",
    }
    for source_name, output in generated_assets.items():
        source = GENERATED / source_name
        if output.suffix == ".webp":
            save_webp(Image.open(source), output, quality=94)
        else:
            copy2(source, output)

    transparent_webp_assets = {
        "exec-c3de2beb-06e5-4e62-b3d0-1614fe4cc6b8.png": ASSETS / "illustrations" / "pythagoras-cosmic.webp",
        "exec-429aa538-4163-46d3-8aaf-58ccad1e510f.png": ASSETS / "illustrations" / "numeral-1-cosmic.webp",
    }
    for source_name, output in transparent_webp_assets.items():
        image = Image.open(GENERATED / source_name).convert("RGBA")
        image.save(output, "WEBP", quality=91, method=6, exact=True)


def make_program_assets() -> None:
    source = SECTIONS / "06-chuong-trinh-dao-tao-v2.png"
    crops = {
        "program-numerology.png": (105, 325, 305, 525),
        "program-fingerprint.png": (550, 325, 750, 525),
        "program-phone-feng-shui.png": (995, 325, 1195, 525),
        "program-relationship.png": (105, 610, 305, 810),
        "program-home-feng-shui.png": (550, 610, 750, 810),
        "program-yin-home.png": (995, 610, 1195, 810),
    }
    clean_crops = {
        "program-numerology.png": (85, 305, 325, 545),
        "program-fingerprint.png": (530, 305, 770, 545),
        "program-phone-feng-shui.png": (975, 305, 1215, 545),
        "program-relationship.png": (85, 590, 325, 830),
        "program-home-feng-shui.png": (530, 590, 770, 830),
        "program-yin-home.png": (975, 590, 1215, 830),
    }
    for name, box in crops.items():
        crop_circle(source, box, ASSETS / "_source-crops" / "programs" / name, mask_inset=10)
        v2_name = name.removesuffix(".png") + "-v2.png"
        crop_largest_subject(source, clean_crops[name], ASSETS / "programs" / v2_name)


def make_method_assets() -> None:
    source = SECTIONS / "05-tam-nhin-phuong-phap.png"
    crops = {
        "method-pythagoras.png": (272, 356, 440, 524),
        "method-ikigai.png": (686, 356, 854, 524),
        "method-life-path.png": (1100, 356, 1268, 524),
    }
    for name, box in crops.items():
        crop_circle(source, box, ASSETS / "methods" / name)


def make_blog_assets() -> None:
    source = Image.open(SECTIONS / "07-kien-thuc-blog.png")
    crops = {
        "blog-pythagoras-calculation.webp": (114, 249, 775, 536),
        "blog-name-numerology.webp": (794, 249, 1087, 480),
        "blog-life-pyramid.webp": (794, 499, 1087, 751),
        "blog-numerology-arrows.webp": (114, 767, 446, 927),
    }
    for name, box in crops.items():
        save_webp(source.crop(box), ASSETS / "blog" / name, quality=93)


def main() -> None:
    ensure_dirs()
    make_backgrounds_and_generated_illustrations()
    make_logos()
    make_program_assets()
    make_method_assets()
    make_blog_assets()


if __name__ == "__main__":
    main()
