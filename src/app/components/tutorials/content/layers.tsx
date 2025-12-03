import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import { LuCrop } from "react-icons/lu";
import {
  nodeExists,
  edgeExistsBetween,
  and,
  inLayer,
  layerExists,
} from "../helpers";

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
      title: "Great",
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
          <p>
            Keep in mind, this will automatically switch you to the new layer.
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
      nextCondition: layerExists((l) => l.name === "Layer 1"),
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
            Create a mix node, from the blend category, and set the input colors
            A and B to red and blue respectively.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong>If you find it handy, you
            can set colors using the hexa values
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => {
        if (n.data.type !== "mix") return false;

        const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
        const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

        const firstIsRed = r1 > 0.8 && g1 < 0.1 && b1 < 0.1;
        const secondIsBlue = r2 < 0.1 && g2 < 0.1 && b2 > 0.8;

        return firstIsRed && secondIsBlue;
      }),
    },
    {
      title: "Excellent!!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the{" "}
            <strong className="font-bold">
              underlying layer&apos;s output{" "}
            </strong>
            into the <strong className="font-bold">mix node&apos;s</strong>{" "}
            factor input and the{" "}
            <strong className="font-bold">mix node&apos;s</strong> output to the
            output of the current layer.
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
              pinned: false,
              panel: "library",
            },
          },
        });
      },
      nextCondition: and(
        edgeExistsBetween("__input_layer:color", "mix:factor"),
        edgeExistsBetween("mix:output", "__output:color"),
      ),
    },
    {
      title: "Resizing",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now that we have a clear effect going, we will play with the layer
            controls. To set the layer size we will need to enable layer
            controls, this can be done by the menu at the top of the screen or
            by clicking the layer control icon:
          </p>
          <LuCrop />
          <p>You should see a green outline around your image in the canvas.</p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: (p) => useConfigStore.getState().view.layerHandles, // TODO, no se actualiza el coso cuando lo clickeas
    },
    {
      title: "Resizing",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now that you have access to the controls, you should see a green
            outline around the image in your canvas. Try to set the width to to
            half of the max size, you can do this by{" "}
            <strong className="font-bold">dragging</strong> on one of the edges
            of the green outline.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also move the
            layer&apos;s selected area around by dragging it.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: (p) =>
        p.layers[p.currentLayer].size.width < 0.5 * p.properties.canvas.width,
    },
    {
      title: "Thats it",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You can see now that the layer we just created will only apply
            effects to the underlying layer if its inside the selected area.
            This has different effects if combined with pictures and more
            complex node webs, but ill let the experimentation to you.
          </p>
          <p>
            Remember that if you ever want to reset the layer bounds you can do
            so with the option{" "}
            <strong className="font-bold">Fit to canvas</strong> in the{" "}
            <strong className="font-bold">layer menu</strong> on the{" "}
            <strong className="font-bold">top of the screen.</strong>
          </p>
        </div>
      ),
    },
    {
      title: "In/Export",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Also you can export and import layers with the options in the top
            menu and the layers panel.
          </p>
        </div>
      ),
    },
    /// end
  ],
};
