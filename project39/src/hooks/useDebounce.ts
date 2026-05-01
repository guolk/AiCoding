import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseDebouncedCallbackOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  options: UseDebouncedCallbackOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true } = options;
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastExecutedRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      const shouldCallLeading = leading && now - lastExecutedRef.current > delay;

      if (shouldCallLeading) {
        lastExecutedRef.current = now;
        callbackRef.current(...args);
        return;
      }

      if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now();
          callbackRef.current(...args);
        }, delay);
      }
    },
    [delay, leading, trailing]
  );
}
