import { LinkButton } from "@/ui/button";
import { LuHeart } from "react-icons/lu";

export function ContributeButton() {
  return (
    <LinkButton href="https://www.buymeacoffee.com/nodething" variant="outline">
      <LuHeart size={16} />
      Contribute
    </LinkButton>
  );
}
