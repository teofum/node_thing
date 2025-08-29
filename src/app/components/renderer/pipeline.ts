import { Edge, Node } from "@/schemas/node.schema";
import { Layer } from "@/store/store";
import { NODE_TYPES } from "@/utils/node-type";

type Buffer = {
  idx: number;
  users: Edge["to"][];
};

export function buildRenderPipeline({ nodes, edges }: Layer) {
  const queue: Node[] = [];
  const buffers: Buffer[] = [];

  /*
   * Find the root nodes we're starting from.
   * A node is a root if it has no imputs, or if all of its inputs are static
   * (main input, aux image input)
   */
  const roots = nodes.filter((node) => {
    if (node.id.startsWith("__input")) return false;
    const inputs = edges.filter((edge) => edge.to.nodeId === node.id);
    return (
      inputs.length === 0 ||
      inputs.every((edge) => edge.from.nodeId.startsWith("__input"))
    );
  });

  console.log("Roots: ", roots);

  queue.push(...roots);

  /*
   * Helper function.
   * Get a buffer suitable for writing, or create one if there are none.
   */
  function findOrCreateBuffer() {
    let freeBuffer = buffers.find((buf) => buf.users.length === 0);
    if (!freeBuffer) {
      freeBuffer = { idx: buffers.length, users: [] };
      buffers.push(freeBuffer);
    }

    return freeBuffer;
  }

  /*
   * Explore the graph in order
   */
  let i = 0;
  while (queue.length > 0) {
    if (i++ > 1000) {
      console.error("max iteration count exceeded");
      break;
    }

    // We just asserted the array has items, unshift will never return undefined
    const node = queue.shift() as Node;
    const nodeType = NODE_TYPES[node.type];

    /*
     * Get a list of dependencies
     */
    const deps = Object.keys(nodeType.inputs)
      .filter(
        (input) =>
          !edges.some(
            (edge) =>
              edge.from.nodeId.startsWith("__input") &&
              edge.to.nodeId === node.id &&
              edge.to.input === input,
          ),
      )
      .map((input) => ({
        input,
        buf: buffers.find((buf) =>
          buf.users.some((u) => u.input === input && u.nodeId === node.id),
        ),
      }));

    /*
     * If there are unresolved dependencies, push the node to the end of the
     * queue and skip it for now
     */
    const hasUnresolvedDeps = deps.some((d) => d.buf === undefined);
    if (hasUnresolvedDeps) {
      console.warn(`Node ${node.id} has unresolved dependencies, skipping`);
      queue.push(node);
      continue;
    }
    const dependencies = deps as { input: string; buf: Buffer }[];

    // TODO: end on output node

    console.log(`Rendering node "${node.id}" [${node.type}]`);
    for (const dep of dependencies) {
      console.log(`[${dep.buf.idx}] -> ${dep.input}`);
    }

    /*
     * Assign a buffer to each output
     */
    for (const out of Object.keys(nodeType.outputs)) {
      const buf = findOrCreateBuffer();

      edges
        .filter(
          (edge) => edge.from.nodeId === node.id && edge.from.output === out,
        )
        .map((edge) => edge.to)
        .forEach((input) => {
          // Connect relevant inputs to buffer
          buf.users.push(input);

          // Queue the connected node if it's not queued already
          const inputNode = nodes.find((n) => n.id === input.nodeId);
          if (inputNode && !queue.includes(inputNode)) {
            queue.push(inputNode);
          }
        });

      console.log(
        `${node.id}/${out} -> [${buf.idx}] -> ${buf.users.map((u) => `${u.nodeId}/${u.input}`)}`,
      );
    }

    /*
     * Unlink this node from all buffers it depends on
     */
    for (const dep of dependencies) {
      dep.buf.users = dep.buf.users.filter((user) => user.nodeId !== node.id);
    }
  }
}
