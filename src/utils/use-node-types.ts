import { NodeType } from "@/schemas/node.schema";
import { getAllNodeTypes } from "@/store/project.actions";
import { useProjectStore } from "@/store/project.store";
import { useMemo } from "react";

export function useNodeTypes(): Record<string, NodeType> {
  const nodeTypes = useProjectStore((s) => s.nodeTypes);
  return useMemo(() => getAllNodeTypes(nodeTypes), [nodeTypes]);
}
