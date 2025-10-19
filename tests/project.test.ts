import {
  createInitialState,
  createLayer,
  prepareProjectForExport,
} from "@/store/project.actions";
import { NodeTypes } from "@/store/project.types";
import { NODE_TYPES } from "@/utils/node-type";

const nodeTypes: NodeTypes = NODE_TYPES;

describe("createLayer", () => {
  it("includes an output node", () => {
    const newLayer = createLayer("New layer");

    expect(newLayer.nodes.length).toBeGreaterThan(0);
    expect(newLayer.nodes[0].data.type).toBe("__output");
    expect(newLayer.nodes[0].id).toBe("__output");
  });

  it("includes only valid edges", () => {
    const newLayer = createLayer("New layer");

    for (const edge of newLayer.edges) {
      const source = newLayer.nodes.find((node) => node.id === edge.source);
      const target = newLayer.nodes.find((node) => node.id === edge.target);

      expect(source).toBeDefined();
      expect(target).toBeDefined();

      const sourceType = nodeTypes[source!.data.type];
      const targetType = nodeTypes[target!.data.type];
      expect(sourceType.inputs).toHaveProperty(edge.sourceHandle ?? "");
      expect(targetType.inputs).toHaveProperty(edge.targetHandle ?? "");
    }
  });
});

describe("createInitialState", () => {
  it("contains at least one layer", () => {
    const project = createInitialState();

    expect(project.layers[0]).toBeDefined();
  });

  it("contains default node types", () => {
    const project = createInitialState();

    expect(project.nodeTypes.default).toBe(NODE_TYPES);
  });

  it("contains no custom node types", () => {
    const project = createInitialState();

    expect(project.nodeTypes.custom).toEqual({});
  });

  it("contains no external node types", () => {
    const project = createInitialState();

    expect(project.nodeTypes.external).toEqual({});
  });
});

describe("prepareProjectForExport", () => {
  const project = createInitialState();
  const customNodeTypes: NodeTypes = {
    test: {
      name: "Test node",
      category: "Custom",
      shader: "",
      inputs: {},
      outputs: {},
      parameters: {},
    },
  };
  project.nodeTypes.custom = customNodeTypes;
  project.nodeTypes.external = customNodeTypes;

  it("contains the same layer data", () => {
    const projectExport = prepareProjectForExport(project);

    expect(projectExport.layers).toEqual(project.layers);
  });

  it("exports custom nodes", () => {
    const projectExport = prepareProjectForExport(project);

    expect(projectExport.nodeTypes).toBeDefined();
    expect(projectExport.nodeTypes?.custom).toEqual(customNodeTypes);
  });

  it("does not export default nodes", () => {
    const projectExport = prepareProjectForExport(project);

    expect(projectExport.nodeTypes).toBeDefined();
    expect(projectExport.nodeTypes?.default).toBeUndefined();
  });

  it("does not export external nodes", () => {
    const projectExport = prepareProjectForExport(project);

    expect(projectExport.nodeTypes).toBeDefined();
    expect(projectExport.nodeTypes?.external).toBeUndefined();
  });
});
