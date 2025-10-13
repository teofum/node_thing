import cn from "classnames";
import {
  DraggableNumberInput,
  type DraggableNumberInputProps,
} from "draggable-number-input";

type NumberDragProps = DraggableNumberInputProps & {
  display?: (value: number, significantDigits: number) => string;
  progress?: boolean;
};

export function NumberDrag({
  className,
  modifierKeys,
  step,
  display = (v, sd) => v.toFixed(sd),
  progress = false,
  ...props
}: NumberDragProps) {
  const nstep = Number(step ?? 1);
  const showBackground =
    progress && props.max !== undefined && props.min !== undefined;
  const percent =
    ((props.value - (props.min ?? 0)) / ((props.max ?? 1) - (props.min ?? 0))) *
    100;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-current/15 hover:bg-current/10 active:text-teal-400 transition-colors duration-200 overflow-hidden",
        className,
      )}
    >
      {showBackground ? (
        <div
          className="pointer-events-none absolute inset-0 bg-current/10"
          style={{ width: `${percent}%` }}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center font-medium text-sm/4">
        {display(props.value, Math.max(0, -Math.floor(Math.log10(nstep))))}
      </div>
      <DraggableNumberInput
        className="w-full opacity-0 text-sm/4 p-2"
        modifierKeys={{
          default: { multiplier: nstep, sensitivity: 0.5 },
          shiftKey: { multiplier: nstep * 10, sensitivity: 0.25 },
          ...modifierKeys,
        }}
        {...props}
      />
    </div>
  );
}
