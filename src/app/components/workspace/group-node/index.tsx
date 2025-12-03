import { NodeProps } from "@xyflow/react";

import { GroupNode } from "@/store/project.types";

export function RenderGroupNode(props: NodeProps<GroupNode>) {
  return <div className="p-4 bg-red-500">group</div>;
}
