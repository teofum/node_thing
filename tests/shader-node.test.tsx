import React from "react";
import { createNode } from "@/utils/node";
import { render, screen } from "@testing-library/react";
import { NodeOutput } from "@/app/components/workspace/shader-node/node-output";
import { NODE_TYPES } from "@/utils/node-type";

describe("createNode() test", () => {
  it("createNode() test", () => {
    const nodeTypes = {
      MathNode: { inputs: { a: { type: "number" } }, outputs: {} },
    };
    const node = createNode("mix", { x: 1, y: 2 }, NODE_TYPES, {
      a: { value: "5" },
    });

    expect(node.type).toBe("RenderShaderNode");
    expect(node.position).toEqual({ x: 1, y: 2 });
    expect(node.data.parameters.a.value).toBe("5");
  });
});

// testeo renderizado de componentes individuales de shader-node
describe("shader-node components test", () => {
  it("NodeOutput output test", () => {
    render(
      <NodeOutput
        id="node1"
        type="MathNode"
        data={{
          type: "MathNode",
          defaultValues: { a: 0 },
          parameters: { a: { value: "5" } },
        }}
        output={["result", { name: "result", type: "number" as const }]}
        i={0}
        offset={0}
        mock={true}
        width={100}
        height={50}
        selected={false}
        dragging={false}
        zIndex={0}
        selectable={false}
        deletable={false}
        draggable={false}
        isConnectable={false}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />,
    );

    expect(screen.getByText("result")).toBeInTheDocument();
  });

  // TODO demás
  // problemas: se rompe todo con componentes que usan useStore y los que llaman a alguna acción de supabase
});
