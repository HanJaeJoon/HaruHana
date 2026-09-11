import { isTabActive, shouldShowTabs } from '../nav';

describe('isTabActive', () => {
  it('같은 경로면 활성이다', () => {
    expect(isTabActive('/', '/')).toBe(true);
    expect(isTabActive('/calendar', '/calendar')).toBe(true);
  });

  it('다른 경로면 비활성이다', () => {
    expect(isTabActive('/calendar', '/')).toBe(false);
    expect(isTabActive('/', '/settings')).toBe(false);
  });

  it('끝 슬래시와 쿼리는 무시한다', () => {
    expect(isTabActive('/calendar/', '/calendar')).toBe(true);
    expect(isTabActive('/archive?from=today', '/archive')).toBe(true);
    expect(isTabActive('', '/')).toBe(true);
  });
});

describe('shouldShowTabs', () => {
  it('목표 설정 흐름에서는 숨긴다', () => {
    expect(shouldShowTabs('/onboarding')).toBe(false);
    expect(shouldShowTabs('/onboarding/')).toBe(false);
  });

  it('나머지 화면에서는 보인다', () => {
    expect(shouldShowTabs('/')).toBe(true);
    expect(shouldShowTabs('/calendar')).toBe(true);
    expect(shouldShowTabs('/settings')).toBe(true);
  });
});
