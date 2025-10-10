import React from "react";
import { render, screen } from "@testing-library/react";
import { NodeOutput } from "@/app/components/workspace/shader-node/node-output";
import { RenderShaderNode } from "@/app/components/workspace/shader-node/index";
import { Viewport } from "@/app/components/workspace/viewport";
import { ReactFlowProvider } from "@xyflow/react";

jest.mock("@/src/store/main.store", () => ({
  useMainStore: jest.fn((selector) =>
    selector({
      nodeTypes: {
        test: {
          name: "Number",
          category: "Math",
          inputs: {},
          outputs: {},
          parameters: {},
          isPurchased: false,
        },
      },
      layers: {
        0: { nodes: [], edges: [] },
      },
      currentLayer: 0,
      onNodesChange: jest.fn(),
      onEdgesChange: jest.fn(),
      onConnect: jest.fn(),
      addNode: jest.fn(),
    }),
  ),
}));

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

  it("RenderShaderNode test", () => {
    render(
      <RenderShaderNode
        id="node1"
        selected={false}
        mock={true}
        type="shader"
        data={{
          type: "test",
          defaultValues: { value: 2 },
          parameters: {},
        }}
        dragging={false}
        draggable={false}
        selectable={false}
        deletable={false}
        zIndex={0}
        isConnectable={false}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />,
    );

    expect(screen.getByText("Number")).toBeInTheDocument();
  });
});

// testeo React Flow
describe("React Flow test", () => {
  ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  it("React Flow test", () => {
    render(
      <ReactFlowProvider>
        <Viewport />
      </ReactFlowProvider>,
    );

    expect(screen.getByText("React Flow")).toBeInTheDocument();
  });
});
