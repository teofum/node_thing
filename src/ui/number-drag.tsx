import { useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import useCallbackRef from "@/utils/use-callback-ref";
import { clamp } from "@/utils/clamp";

/*
 * Stolen from here
 * https://github.com/brettlyne/draggable-number-input/blob/main/src/react/DraggableNumberInput.tsx
 */

type Modifier = {
  multiplier: number;
  sensitivity: number;
};

type Modifiers = {
  [key in "default" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey"]: Modifier;
};

function defaultModifiers(step: number): Modifiers {
  return {
    default: { multiplier: step, sensitivity: 1 },
    ctrlKey: { multiplier: step, sensitivity: 1 },
    shiftKey: { multiplier: step, sensitivity: 10 },
    metaKey: { multiplier: step, sensitivity: 1 },
    altKey: { multiplier: step, sensitivity: 0.5 },
  };
}

function getDecimalPlaces(multiplier: number) {
  return Math.max(0, -Math.floor(Math.log10(multiplier)));
}

function handleArrow(
  e: React.KeyboardEvent,
  multiplier: number,
  value: number,
) {
  if (e.key === "ArrowUp") {
    return value + multiplier;
  }
  if (e.key === "ArrowDown") {
    return value - multiplier;
  }
  return value;
}

type NumberDragProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> & {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  modifierKeys?: Modifiers;
  disablePointerLock?: boolean;
  display?: (value: number, significantDigits: number) => string;
  progress?: boolean;
  size?: "sm" | "md";
};

export function NumberDrag({
  value,
  min,
  max,
  step = 0.01,
  display = (v, sd) => v.toFixed(sd),
  progress = false,
  size = "md",
  className,
  disablePointerLock = false,
  modifierKeys,
  onChange,
  onDragStart,
  onDragEnd,
  style,
  ...props
}: NumberDragProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));

  const totalMovement = useRef(0);
  const startValue = useRef(0);
  const startX = useRef(0);
  const currentMultiplier = useRef(1);

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
    const val = e.target.value;
    setLocalValue(val);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      constrainedOnChange(num);
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!inputRef.current) return;
      let x = 0;
      if ("clientX" in e && "clientY" in e) x = e.clientX;
      if ("touches" in e) x = e.touches[0].clientX;

      setIsMouseDown(true);
      startX.current = x;
      startValue.current = value;
      totalMovement.current = 0;
    },
    [value],
  );

  const getModifiers = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent | MouseEvent | TouchEvent) => {
      const mods = { ...defaultModifiers(step), ...modifierKeys };

      for (const key in mods) {
        if (key !== "default" && e[key as keyof typeof e]) {
          currentMultiplier.current = mods[key as keyof typeof mods].multiplier;
          return mods[key as keyof typeof mods];
        }
      }
      currentMultiplier.current = mods.default.multiplier;
      return mods.default;
    },
    [modifierKeys, step],
  );

  const applyMovement = useCallback(
    (newMovement: number, e: KeyboardEvent | MouseEvent | TouchEvent) => {
      const { sensitivity, multiplier } = getModifiers(e);
      const delta = newMovement * sensitivity * multiplier;
      let newValue = startValue.current + delta;
      newValue = Math.round(newValue / multiplier) * multiplier;
      newValue = Object.is(newValue, -0) ? 0 : newValue; // avoid -0
      constrainedOnChange(newValue);
    },
    [constrainedOnChange, getModifiers],
  );

  const updateDelta = useCallback(
    (e: KeyboardEvent) => {
      if (!isMouseDown) return;
      applyMovement(totalMovement.current, e);
    },
    [isMouseDown, applyMovement],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault(); // prevent default to avoid any selection / flickering
      const { multiplier } = getModifiers(e);
      const newValue = handleArrow(e, multiplier, value);
      constrainedOnChange(newValue);
    } else if (e.key === "Enter") {
      e.preventDefault(); // prevent default to avoid any selection / flickering

      const val = e.currentTarget.value;
      const num = parseFloat(val);
      if (!isNaN(num)) {
        constrainedOnChange(num);
      }
    }
  };

  const handleModifierKeyDuringDrag = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === "Shift" ||
        e.key === "Control" ||
        e.key === "Meta" ||
        e.key === "Alt"
      ) {
        updateDelta(e);
      }
    },
    [updateDelta],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown) return;

      if ("touches" in e) {
        e.preventDefault();
      }

      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const newMovement =
        disablePointerLock || "touches" in e
          ? x - startX.current
          : totalMovement.current + e.movementX;
      if (!isDragging && newMovement !== 0) {
        if (!disablePointerLock && !("touches" in e)) {
          inputRef.current?.requestPointerLock?.();
        }
        setIsDragging(true);
        document.addEventListener("keydown", handleModifierKeyDuringDrag);
        document.addEventListener("keyup", handleModifierKeyDuringDrag);
        onDragStart?.();
      }
      totalMovement.current = newMovement;

      applyMovement(newMovement, e);
    },
    [
      isMouseDown,
      disablePointerLock,
      startX,
      isDragging,
      onDragStart,
      applyMovement,
      handleModifierKeyDuringDrag,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    totalMovement.current = 0;
    if (isDragging) {
      setIsDragging(false);
      document.removeEventListener("keydown", handleModifierKeyDuringDrag);
      document.removeEventListener("keyup", handleModifierKeyDuringDrag);
      onDragEnd?.();
    }
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isDragging, handleModifierKeyDuringDrag, onDragEnd]);

  useEffect(() => {
    if (isMouseDown) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isMouseDown, handleMouseMove, handleMouseUp]);

  const showBackground = progress && max !== undefined && min !== undefined;
  const percent = ((value - (min ?? 0)) / ((max ?? 1) - (min ?? 0))) * 100;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-current/15 hover:bg-current/10 active:text-teal-400 transition-colors duration-200 overflow-hidden text-xs/3",
        className,
      )}
    >
      {showBackground ? (
        <div
          className="pointer-events-none absolute inset-0 bg-current/10"
          style={{ width: `${percent}%` }}
        />
      ) : null}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="-?[0-9]*\.?[0-9]*"
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative tabular-nums outline-none select-none text-center",
          "active:text-teal-400 transition-colors duration-200",
          {
            "text-xs/3 p-0.5 h-5": size === "sm",
            "text-sm/4 p-2": size === "md",
          },
          className,
        )}
        style={{
          cursor: "ew-resize",
          caretColor: isDragging ? "transparent" : "initial",
          ...style,
        }}
        {...props}
      />
    </div>
  );
}
