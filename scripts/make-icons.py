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
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"

INK_LIGHT = (17, 17, 17, 255)  # #111111 - 라이트 배경 위의 도형
INK_DARK = (242, 242, 242, 255)  # #f2f2f2 - 다크 배경 위의 도형
PAPER = (245, 245, 245, 255)  # #f5f5f5 - kit 팔레트의 라이트 배경

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

    print("생성 완료:", ", ".join(sorted(p.name for p in OUT.glob("*.png"))))


if __name__ == "__main__":
    main()
