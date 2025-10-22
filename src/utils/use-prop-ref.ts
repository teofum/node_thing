import { useEffect, useRef } from "react";

/**
 * Transform a plain value (e.g., comoponent prop) into a React ref that is
 * updated when the value changes. This allows the value to be used in external
 * callbacks such as those passed to `requestAnimationFrame`.
 */
export function usePropRef<T>(prop: T) {
  const ref = useRef(prop);

  useEffect(() => {
    ref.current = prop;
  }, [prop]);

  return ref;
}
