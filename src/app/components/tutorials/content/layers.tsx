import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import { LuEllipsisVertical } from "react-icons/lu";
import { nodeExists, edgeExistsBetween, and } from "../helpers";

export const layerIntro: Tutorial = {
  id: "layers",
  name: "Layers introduction",
  description: "A simple tutorial to explore layer controls",
  steps: [
    {
      title: "Welcome to layers!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Node thing gives you the possibility of working with layers, this
            will allow you to separate effects into different layers and keep an
            organized workspace.
          </p>

          <p>
            Let&apos;s start with the basics:{" "}
            <strong className="font-bold"> creating a background layer.</strong>
          </p>
        </div>
      ),
    },
    {
      title: "Place a node",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Place the <strong className="font-bold">voronoi noise</strong> node.
            You can see details about this node in its{" "}
            <strong className="font-bold">tooltip</strong>. We will use it to
            make a basic patter for our background layer.
          </p>
          <p>
            Find the <strong className="font-bold">voronoi noise</strong> node
            in the Library panel in the{" "}
            <strong className="font-bold">generate</strong> section, drag it
            onto the workspace and connect the output.
          </p>

          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also add nodes
            by <strong className="font-bold">right clicking</strong> anywhere in
            the workspace!
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can see a nodes
            tooltip by <strong className="font-bold">hovering</strong> your
            mouse over it in the library.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      onStart: () => {
        const { view } = useConfigStore.getState();
        useConfigStore.setState({
          view: {
            ...view,
            sidebar: {
              pinned: true,
              panel: "library",
            },
          },
        });
      },
      nextCondition: and(
        nodeExists((n) => n.data.type === "voronoi_noise"),
        edgeExistsBetween("voronoi_noise:output", "__output:color"),
      ),
    },
    {
      title: "Greate",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now this will be our background, we will now create a layer on top
            of this one and apply an effect on it. Remember that on this layer
            you could place anything you like, images, effects and whatnot.
          </p>
        </div>
      ),
    },
    {
      title: "Create a new layer",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            To do this you will have to{" "}
            <strong className="font-bold">click</strong>
            the <strong className="font-bold">New Layer</strong> button in the
            Layers panel. It should be at the bottom left of your screen.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      onStart: () => {
        const { view } = useConfigStore.getState();
        useConfigStore.setState({
          view: {
            ...view,
            sidebar: {
              pinned: true,
              panel: "layers",
            },
          },
        });
      },
      //nextCondition: layerExists((n) => n. === "Layer 1"), // TODO
    },
    {
      title: "Use the undelying layer",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now, to use the layers underneath your current one you will have to
            use the <strong className="font-bold">Underlying Layer</strong>{" "}
            node. This node&apos;s output is the output of the layer directly
            below this one.
          </p>
          <p>
            Look for this node in the input section of the Library or by right
            clicking the canvas. Drop it in the canvas.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(nodeExists((n) => n.data.type === "__input_layer")),
    },
    {
      title: "Excellent!!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now we will apply an effect on this to more easily see how the
            layers work.
          </p>
          <p>
            Create a mix node, set the input colors A and B to red and blue
            respectively. Then connect the underlying layer output into the
            factor input and the output to the output of the current layer.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong>If you find it handy, you
            can set colors using the hexa values
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => n.data.type === "mix"),
        //edgeExistsBetween("__input_layer:color", "mix:factor"),
        edgeExistsBetween("mix:output", "__output:color"),
        nodeExists((n) => {
          if (n.data.type !== "mix") return false;

          const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
          const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

          const firstIsRed = r1 > 0.8 && g1 < 0.1 && b1 < 0.1;
          const secondIsBlue = r2 < 0.1 && g2 < 0.1 && b2 > 0.8;

          return firstIsRed && secondIsBlue;
        }),
      ),
    },
  ],
};
