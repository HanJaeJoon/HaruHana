/**
 * 뒤로 미루는 디바운스. 연속 호출 중에는 타이머를 계속 재시작하고,
 * 마지막 호출 후 ms 가 지나면 마지막 인자로 한 번만 실행한다.
 *
 * 화면 이탈 시점에 대기 중인 값이 유실되지 않도록 flush 를 제공한다
 * (온보딩 임시 저장이 이 함정 때문에 이 모듈을 쓴다). cancel 은 대기 중인
 * 실행을 버린다 - 저장 대상 자체를 지운 뒤 다시 살아나지 않게 할 때 쓴다.
 */
export type Debounced<Args extends unknown[]> = {
  (...args: Args): void;
  /** 대기 중인 실행이 있으면 지금 즉시 실행한다. 없으면 아무 일도 하지 않는다. */
  flush: () => void;
  /** 대기 중인 실행을 버린다. */
  cancel: () => void;
};

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: Args | undefined;

  const run = () => {
    // timer 정리를 실행보다 먼저 한다. fn 이 던져도 대기 상태가 남지 않게.
    timer = undefined;
    const args = pendingArgs as Args;
    pendingArgs = undefined;
    fn(...args);
  };

  const debounced = (...args: Args) => {
    pendingArgs = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(run, ms);
  };

  debounced.flush = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    run();
  };

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pendingArgs = undefined;
  };

  return debounced;
}
