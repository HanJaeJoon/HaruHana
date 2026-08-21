import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('연속 호출은 마지막 값으로 한 번만 실행된다', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d('ㅎ');
    d('하');
    d('하루');

    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('하루');
  });

  it('호출이 이어지는 동안은 타이머가 계속 밀린다', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d('a');
    jest.advanceTimersByTime(299);
    d('ab');
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('ab');
  });

  it('flush 는 대기 중인 마지막 값을 즉시 실행한다 (300ms 를 기다리지 않는다)', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d('마지막');
    d.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('마지막');

    // flush 로 소진된 실행이 타이머 만료로 다시 실행되지 않는다.
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('대기 중인 것이 없으면 flush 는 아무 일도 하지 않는다', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d.flush();
    expect(fn).not.toHaveBeenCalled();

    d('값');
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);

    // 이미 실행이 끝난 뒤의 flush 도 재실행하지 않는다.
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel 은 대기 중인 실행을 버린다 (이후 타이머 만료/flush 로도 실행되지 않는다)', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d('버려질 값');
    d.cancel();

    jest.advanceTimersByTime(300);
    d.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it('실행 후에 다시 호출하면 새 디바운스 주기가 시작된다', () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d(1);
    jest.advanceTimersByTime(300);
    d(2);
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 1);
    expect(fn).toHaveBeenNthCalledWith(2, 2);
  });
});
