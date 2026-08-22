"""무채색 아이콘/스플래시 자산 생성기.

도형은 하나뿐이다 - 가는 테두리 원 안에 채운 점 하나. "하나에 집중"을 그대로 옮긴
표시이고, 48px 로 줄여도 형태가 남는다. 색은 쓰지 않는다 (설계 결정 8).

    python scripts/make-icons.py

만드는 것 (docs/RELEASE.md 의 규격 표를 따른다):
    assets/images/icon.png                      1024x1024, 배경 있음
    assets/images/android-icon-foreground.png   432x432, 투명, 안쪽 66% 안에 도형
    assets/images/android-icon-background.png   432x432, 단색
    assets/images/android-icon-monochrome.png   432x432, 투명, 단색 실루엣
    assets/images/splash-icon.png               512x512, 투명, 어두운 도형 (라이트용)
    assets/images/splash-icon-dark.png          512x512, 투명, 밝은 도형 (다크용)
    assets/images/favicon.png                   48x48, 배경 있음

Play Console 에 직접 올리는 것 (docs/store-listing/README.md 의 표):
    docs/store-listing/graphics/play-icon-512.png          512x512, 배경 있음
    docs/store-listing/graphics/feature-graphic-1024x500.png  1024x500
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"
STORE = ROOT / "docs" / "store-listing" / "graphics"

INK_LIGHT = (17, 17, 17, 255)  # #111111 - 라이트 배경 위의 도형
INK_DARK = (242, 242, 242, 255)  # #f2f2f2 - 다크 배경 위의 도형
PAPER = (245, 245, 245, 255)  # #f5f5f5 - kit 팔레트의 라이트 배경
COAL = (18, 18, 18, 255)  # #121212 - kit 팔레트의 다크 배경

SUPERSAMPLE = 4  # 원을 매끄럽게 그리려고 크게 그린 뒤 줄인다


def draw_mark(size: int, ink, background=None, scale: float = 1.0) -> Image.Image:
    """테두리 원 + 가운데 점. scale 은 캔버스에 대한 도형의 크기 비율이다."""
    big = size * SUPERSAMPLE
    image = Image.new("RGBA", (big, big), background or (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    center = big / 2
    ring_outer = big * 0.37 * scale
    ring_width = big * 0.040 * scale
    dot_radius = big * 0.145 * scale

    draw.ellipse(
        [center - ring_outer, center - ring_outer, center + ring_outer, center + ring_outer],
        outline=ink,
        width=max(1, round(ring_width)),
    )
    draw.ellipse(
        [center - dot_radius, center - dot_radius, center + dot_radius, center + dot_radius],
        fill=ink,
    )

    return image.resize((size, size), Image.LANCZOS)


def solid(size: int, color) -> Image.Image:
    return Image.new("RGBA", (size, size), color)


# 66일 눈금에 무엇이 채워져 있는지. 11칸 x 6줄 = 66 이고 X 가 해낸 날이다.
# 실제 사용 모습에 맞춰 군데군데 비워 뒀다. 붙어 있는 긴 구간을 만들지 않는 것이
# 중요하다 - 연속(streak)을 세지 않는 앱이라 "이어져야 한다"로 읽히면 안 된다.
DONE_PATTERN = [
    "XX.XXX.XXXX",
    "X.XXX.XX.XX",
    "XXX.XXX.X.X",
    ".XXX.X.XX..",
    "X.X..X..X..",
    "...........",  # 아직 오지 않은 날들
]


def render_feature_graphic(path: Path, width: int = 1024, height: int = 500) -> None:
    """Play 그래픽 이미지.

    글자를 넣지 않는다. ko / en 두 언어에 하나를 공용으로 쓰기 때문이고,
    언어별로 만들려면 CJK 폰트를 챙겨야 해서 두부 현상 위험이 생긴다.

    구성은 두 덩어리뿐이다. 왼쪽은 아이콘과 같은 마크(같은 앱으로 읽히게),
    오른쪽은 66일 눈금과 그 위에 찍힌 기록이다. 채운 점은 해낸 날, 흐린 점은
    아직 표시가 없는 날이고 앱의 달력 마킹(무채색 채움 점 하나)과 같은 도형이다.
    장식은 넣지 않았다.
    """
    big_w, big_h = width * SUPERSAMPLE, height * SUPERSAMPLE

    # 위에서 아래로 아주 옅게 어두워지는 배경. #121212 주변에서만 움직이므로
    # 색이 생기지 않는다. 폴리곤을 쌓으면 경계가 보이니 픽셀 행으로 만든다.
    column = Image.new("RGB", (1, big_h))
    for y in range(big_h):
        v = round(28 - 14 * (y / big_h))
        column.putpixel((0, y), (v, v, v))
    image = column.resize((big_w, big_h)).convert("RGBA")

    # ImageDraw 는 알파를 합성하지 않고 픽셀을 덮어쓴다. 반투명 눈금을 배경에
    # 직접 그리면 불투명해지므로 레이어를 따로 만들어 alpha_composite 로 얹는다.
    def overlay(paint) -> None:
        nonlocal image
        layer = Image.new("RGBA", (big_w, big_h), (0, 0, 0, 0))
        paint(ImageDraw.Draw(layer))
        image = Image.alpha_composite(image, layer)

    columns, rows = len(DONE_PATTERN[0]), len(DONE_PATTERN)
    left, right = big_w * 0.42, big_w * 0.92
    step = (right - left) / (columns - 1)
    top = (big_h - step * (rows - 1)) / 2
    done_radius = step * 0.22
    tick_radius = step * 0.10

    def paint_days(draw: ImageDraw.ImageDraw) -> None:
        for row, line in enumerate(DONE_PATTERN):
            for col, cell in enumerate(line):
                cx, cy = left + col * step, top + row * step
                done = cell == "X"
                radius = done_radius if done else tick_radius
                # 눈금은 흐리게 둔다. 해낸 날만 또렷하게 보이는 것이 앱의 규칙이다.
                fill = INK_DARK if done else INK_DARK[:3] + (56,)
                draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=fill)

    overlay(paint_days)
    image = image.resize((width, height), Image.LANCZOS)

    # 마크는 draw_mark 가 만든 것을 그대로 얹는다. 아이콘과 같은 도형이어야 한다.
    mark_size = round(height * 0.62)
    mark = draw_mark(mark_size, INK_DARK)
    image.alpha_composite(mark, (round(width * 0.11), (height - mark_size) // 2))

    image.convert("RGB").save(path)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # 앱 아이콘 원본: 배경 포함 (투명 배경은 스토어에서 거부된다)
    draw_mark(1024, INK_LIGHT, background=PAPER).save(OUT / "icon.png")

    # 적응형 아이콘: 전경은 안쪽 66% 안에 들어가야 잘리지 않는다.
    # 기본 도형이 이미 지름 74% 라서 0.85 로 줄여 안전 영역에 넣는다.
    draw_mark(432, INK_LIGHT, scale=0.85).save(OUT / "android-icon-foreground.png")
    solid(432, PAPER).save(OUT / "android-icon-background.png")
    # 테마 아이콘은 실루엣만 본다. 색은 시스템이 정하므로 검정으로 둔다.
    draw_mark(432, (0, 0, 0, 255), scale=0.85).save(OUT / "android-icon-monochrome.png")

    # 스플래시는 배경이 테마에 따라 바뀌므로 도형도 두 벌 만든다.
    draw_mark(512, INK_LIGHT).save(OUT / "splash-icon.png")
    draw_mark(512, INK_DARK).save(OUT / "splash-icon-dark.png")

    draw_mark(48, INK_LIGHT, background=PAPER).save(OUT / "favicon.png")

    # Play Console 업로드용. 그래픽 자산이 없으면 프로덕션 버전 저장 자체가 막힌다.
    STORE.mkdir(parents=True, exist_ok=True)
    # 스토어 아이콘도 배경을 넣는다 (투명 배경은 Play 가 거부한다).
    draw_mark(512, INK_LIGHT, background=PAPER).save(STORE / "play-icon-512.png")
    render_feature_graphic(STORE / "feature-graphic-1024x500.png")

    print("생성 완료:", ", ".join(sorted(p.name for p in OUT.glob("*.png"))))
    print("스토어 그래픽:", ", ".join(sorted(p.name for p in STORE.glob("*.png"))))


if __name__ == "__main__":
    main()
