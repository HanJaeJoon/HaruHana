/**
 * 하단 탭의 순수 판정. 라우팅 값 하나만 보고 결정하므로 렌더 없이 테스트한다.
 */

/** 경로 비교용 정규화. 쿼리/해시와 끝 슬래시를 떼고 루트는 '/' 로 남긴다. */
function normalize(path: string): string {
  const base = path.split('?')[0].split('#')[0];
  const trimmed = base.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** 현재 경로가 그 탭인지. */
export function isTabActive(pathname: string, href: string): boolean {
  return normalize(pathname) === normalize(href);
}

/**
 * 탭을 보여줄 경로인지.
 *
 * 목표 설정 흐름(onboarding) 중에는 다른 화면으로 새지 않게 탭을 숨긴다.
 */
export function shouldShowTabs(pathname: string): boolean {
  return normalize(pathname) !== '/onboarding';
}
