import { useCallback, useEffect, useState } from "react";
import useCallbackRef from "@/utils/use-callback-ref";
import { clamp } from "@/utils/clamp";

function getDecimalPlaces(multiplier: number) {
  return Math.max(0, -Math.floor(Math.log10(multiplier)));
}

export function useLocalValue(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number,
  onChange: ((value: number) => void) | undefined,
  display: (value: number, significantDigits: number) => string,
) {
  const [localValue, setLocalValue] = useState(String(value));

  const constrainedOnChange = useCallback(
    (newValue: number) => onChange?.(clamp(newValue, min, max)),
    [onChange, min, max],
  );
  const formatValue = useCallbackRef(display);

  useEffect(() => {
    const decimals = getDecimalPlaces(step);
    setLocalValue(formatValue(value, decimals));
  }, [value, step, formatValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) constrainedOnChange(num);
  };

  return {
    localValue,
    constrainedOnChange,
    formatValue,
    handleInputChange,
    handleBlur,
  };
}
