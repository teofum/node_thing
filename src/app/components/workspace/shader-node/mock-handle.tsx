import { Handle, HandleProps, Position } from "@xyflow/react";
import cn from "classnames";

/*
 * Fake handle for node previews
 */
function MockHandle({ className, style, position }: HandleProps) {
  return (
    <div
      className={cn(
        "react-flow__handle !border-neutral-600 !border",
        {
          "react-flow__handle-left": position === Position.Left,
          "react-flow__handle-right": position === Position.Right,
        },
        className,
      )}
      style={style}
    />
  );
}

export function HandleWithMock({
  mock = false,
  ...props
}: HandleProps & { mock?: boolean }) {
  return mock ? <MockHandle {...props} /> : <Handle {...props} />;
}
