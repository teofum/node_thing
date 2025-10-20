import {
  createInitialState,
  createLayer,
  mergeProject,
  prepareProjectForExport,
} from "@/store/project.actions";
import { NodeTypes } from "@/store/project.types";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

const nodeTypes: NodeTypes = NODE_TYPES;
const customNodeTypes: NodeTypes = {
  test: {
    name: "Test node",
    category: "Custom",
    shader: "",
    inputs: {},
    outputs: {},
    parameters: {},
    externalShaderId: "test_id",
  },
};

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
  project.nodeTypes.custom = customNodeTypes;
  project.nodeTypes.external = customNodeTypes;

  const testExternalNode = createNode(
    "test",
    { x: 0, y: 0 },
    customNodeTypes,
    {},
  );
  project.layers[0].nodes.push(testExternalNode);

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

  it("exports external dependencies", () => {
    const projectExport = prepareProjectForExport(project);

    expect(projectExport.externalDependencies).toBeDefined();
    expect(projectExport.externalDependencies?.nodeTypes[0]).toBeDefined();
    expect(projectExport.externalDependencies?.nodeTypes[0]).toEqual({
      name: "Test node",
      id: "test",
      externalId: "test_id",
    });
  });
});

describe("mergeProject", () => {
  const projectBase = createInitialState();
  const projectImport = createInitialState();
  projectImport.layers[0].size = { width: 100, height: 100 };
  projectImport.layers[0].nodes.push(
    createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {}),
  );
  projectImport.nodeTypes.custom = customNodeTypes;
  projectImport.nodeTypes.default = customNodeTypes;
  projectImport.nodeTypes.external = customNodeTypes;

  it("overrides layers with imported project", () => {
    const merged = mergeProject(projectImport, projectBase);

    expect(merged.layers).toEqual(projectImport.layers);
  });

  it("imports custom node types", () => {
    const merged = mergeProject(projectImport, projectBase);

    expect(merged.nodeTypes.custom).toEqual(projectImport.nodeTypes.custom);
  });

  it("does not import default node types", () => {
    const merged = mergeProject(projectImport, projectBase);

    expect(merged.nodeTypes.default).toEqual(projectBase.nodeTypes.default);
  });

  it("does not import external node types", () => {
    const merged = mergeProject(projectImport, projectBase);

    expect(merged.nodeTypes.external).toEqual(projectBase.nodeTypes.external);
  });
});
