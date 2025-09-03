import useCallbackRef from "./use-callback-ref";

export default function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
) {
  let timeout: NodeJS.Timeout | null = null;

  const debouncedCallback = ((...args) => {
    if (timeout !== null) clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
      timeout = null;
    }, delay);
  }) as T;

  return useCallbackRef(debouncedCallback);
}
