import cn from "classnames";

type Props = {
  text: string;
  color: string;
};

export function CardBadge({ text, color }: Props) {
  return (
    <p
      className={cn(
        `inline-block text-sm text-${color}-400 border border-current/15 font-semibold rounded-lg items-center justify-center gap-2 py-1 px-2 mr-2`,
      )}
    >
      {text}
    </p>
  );
}
