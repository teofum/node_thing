import { NodeProps } from "@xyflow/react";

import { GroupNode } from "@/store/project.types";
import { Button } from "@/ui/button";
import { useProjectStore } from "@/store/project.store";

export function RenderGroupNode(props: NodeProps<GroupNode>) {
  const openGroup = useProjectStore((s) => s.openGroup);

  return (
    <div className="p-4 bg-red-500">
      group
      <Button onClick={() => openGroup(props.id)}>open</Button>
    </div>
  );
}
