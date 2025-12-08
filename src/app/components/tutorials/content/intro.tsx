import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import { LuEllipsisVertical, LuPin } from "react-icons/lu";
import { nodeExists, edgeExistsBetween, and } from "../helpers";

export const intro: Tutorial = {
  id: "intro",
  name: "Introduction",
  description: "A very simple node_thing tutorial",
  steps: [
    {
      title: "Welcome to node thing!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Node thing is an image editor that uses a node based system to let
            you combine effects in many different ways.
          </p>

          <p>
            Let&apos;s start with the basics:{" "}
            <strong className="font-bold">placing and connecting nodes.</strong>
          </p>
        </div>
      ),
    },
    {
      title: "Basic controls",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            The <strong className="font-bold">workspace</strong>, which is the
            space in the middle of your screen, you should see the output node
            in the middle, is where you will place and connect all your images
            and effects using nodes. You can{" "}
            <strong className="font-bold">zoom</strong> in and out with the
            trackpad or <strong className="font-bold">(scroll wheel)</strong>,
            as well as look around it by{" "}
            <strong className="font-bold">clicking</strong> and{" "}
            <strong className="font-bold">dragging</strong> the background.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> Feel free to try it
            right now.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      transparentBackground: true,
    },
    {
      title: "Basic controls",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            To the left of your screen you have the{" "}
            <strong className="font-bold">control panel</strong>. It can be
            deployed by hovering over it and it will collapse when you hover
            away. To keep it open you can use the{" "}
            <strong className="font-bold">pin icon</strong> <LuPin /> on the top
            of the panel.
          </p>
          <p>
            The control panel has different sections:{" "}
            <strong className="font-bold">library</strong>,{" "}
            <strong className="font-bold">layer</strong>,{" "}
            <strong className="font-bold">assets</strong>,{" "}
            <strong className="font-bold">layers</strong>, and{" "}
            <strong className="font-bold">history</strong>. You can change
            between these by clicking where it says{" "}
            <strong className="font-bold">Library</strong> and choosing between
            the options.
          </p>
        </div>
      ),
      transparentBackground: true,
    },
    {
      title: "Basic controls",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You can place nodes with the{" "}
            <strong className="font-bold">panel</strong> to the left (we will be
            doing that in this tutorial) and by right-clicking on the{" "}
            <strong className="font-bold">workspace</strong>.
          </p>
          <p>
            To delete both nodes and connections you can select them by{" "}
            <strong className="font-bold">clicking</strong> and use the{" "}
            <strong className="font-bold">backspace</strong> key on your
            keyboard.
          </p>

          <p>
            You can also undo and redo things with the controls at the top of
            your screen or by pressing{" "}
            <strong className="font-bold">Ctrl+Z</strong>.
          </p>
        </div>
      ),
      transparentBackground: true,
    },
    {
      title: "The Library panel",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You can find all the different nodes, grouped by use, in the{" "}
            <strong className="font-bold">Library panel</strong>.
          </p>
          <p>
            Nodes are made so that all of the{" "}
            <strong className="font-bold">inputs</strong>, things going into the
            node, are on the <strong className="font-bold">left</strong> side.
            And the <strong className="font-bold">outputs</strong>, things
            supposed to go into other nodes, are on the{" "}
            <strong className="font-bold">right</strong> side.
          </p>
        </div>
      ),
    },
    {
      title: "Creating nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            The <strong className="font-bold">UV</strong> node is an{" "}
            <strong className="font-bold">input node</strong> that outputs each
            pixel&apos;s position in the canvas as two numbers.
          </p>
          <p>
            Find the <strong className="font-bold">UV</strong> node in the{" "}
            <strong className="font-bold">input</strong> section in the Library
            panel and drag it onto the workspace.
          </p>

          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also add nodes
            by <strong className="font-bold">right clicking</strong> anywhere in
            the workspace!
          </p>

          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Note:</strong> To keep the control
            panel open I have already clicked the{" "}
            <strong className="font-bold">pin button </strong>
            for you, you shoud see it in green on the top of the pannel.
            <LuPin />
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
      nextCondition: nodeExists((n) => n.data.type === "uv"),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Great! With multiple nodes on the screen, we can start connecting
            them. Remember nodes have{" "}
            <strong className="font-bold">inputs</strong> on the{" "}
            <strong className="font-bold">left</strong> side, and{" "}
            <strong className="font-bold">outputs</strong> on the{" "}
            <strong className="font-bold">right</strong>.
          </p>
          <p>
            To create effects, we will connect outputs to inputs, from left to
            right. You can create new connections by{" "}
            <strong className="font-bold">clicking and dragging</strong> the{" "}
            <strong className="font-bold">dots</strong> next to the output to an
            input, or the other way around.
          </p>
        </div>
      ),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            The <strong className="font-bold">Output</strong> node, highlighted
            in purple, is a special node that{" "}
            <strong className="font-bold">displays its inputs on screen</strong>
            . That means it&apos;s the final stop for all your connections.
          </p>
          <p>
            Now try connecting the <strong className="font-bold">U</strong>{" "}
            output of the <strong className="font-bold">UV node</strong> you
            just created to the <strong className="font-bold">output</strong>{" "}
            node&apos;s <strong className="font-bold">Layer output</strong>.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> Feel free to move the
            nodes around and zoom in or out yout workspace.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      maxWidth: 640,
      nextCondition: edgeExistsBetween("uv:out_u", "__output:color"),
    },
    {
      title: "Input and output types",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You will now see a gradient in the canvas, going from black on the
            left, to white on the right. We just plugged the U, or horizontal,
            coordinate directly into the output.
          </p>
          <p>
            Notice how the output node&apos;s{" "}
            <strong className="font-bold">Layer output</strong> input is
            colored, while the UV node&apos;s outputs are white. This indicates
            they are of different <strong className="font-bold">types</strong>.
          </p>
          <p>
            There are two data types in node thing:{" "}
            <strong className="font-bold text-teal-400">colors</strong>,
            indicated by a{" "}
            <strong className="font-bold text-teal-400">green dot</strong>, and{" "}
            <strong className="font-bold">numbers</strong>, indicated by a{" "}
            <strong className="font-bold">white dot</strong>.
          </p>
          <p>
            You can connect either type interchangeably. A number connected to a
            color input will be interpreted as a gray value, while a color
            connected to a number input will consider its brightness. In this
            case, we just connected a number to a color input, and the result is
            gray. Next, let&apos;s add some color.
          </p>
        </div>
      ),
      transparentBackground: true,
    },
    {
      title: "Default values",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            The UV node we added didn&apos;t have any inputs of its own, but
            most nodes do. That doesn&apos;t mean you have to plug something
            into every input!
          </p>
          <p>
            The <strong className="font-bold">Mix</strong> node is a very useful
            one: it allows you to mix and blend two images in different ways.
            For now, we&apos;ll use it to blend between two different colors.
            You can find the <strong className="font-bold">Mix</strong> node
            under <strong className="font-bold">Blend</strong> in the Library
            panel.
          </p>
          <p>Try adding one now.</p>
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
      nextCondition: nodeExists((n) => n.data.type === "mix"),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the <strong className="font-bold">output</strong> of the{" "}
            <strong className="font-bold">Mix node</strong> you just created to
            the <strong className="font-bold">output</strong> node&apos;s{" "}
            <strong className="font-bold">Layer output</strong>.
          </p>
          <p>
            This will automatically delete the previous edge that was connected
            to this input.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      maxWidth: 640,
      nextCondition: edgeExistsBetween("mix:output", "__output:color"),
    },
    {
      title: "Default values",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You&apos;ll see the Mix node we just added has multiple inputs, left
            side. Right now, they&apos;re not connected to anything. When inputs
            are disconnected, you can set their value manually.
          </p>
          <p>
            In the <strong className="font-bold">Mix</strong> node, try setting
            the <strong className="font-bold">input A</strong> to{" "}
            <strong className="font-bold">red</strong>, and the{" "}
            <strong className="font-bold">input B</strong> to{" "}
            <strong className="font-bold">blue</strong>. you can do this by
            clicking the coloured square next to the input.
          </p>
          <p>
            When you do it right you should see a purple color in the canvas as
            red and blue mix together.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => {
        if (n.data.type !== "mix") return false;

        const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
        const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

        const firstIsRed = r1 > 0.8 && g1 < 0.2 && b1 < 0.2;
        const secondIsBlue = r2 < 0.2 && g2 < 0.2 && b2 > 0.8;

        return firstIsRed && secondIsBlue;
      }),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Great! Notice that the <strong className="font-bold">Factor</strong>{" "}
            input changes the mix ratio of each color.
          </p>
          <p>It should be at 0.5 by default.</p>
        </div>
      ),
      position: { x: 250, y: 67 },
      transparentBackground: true,
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now try connecting the UV node&apos;s{" "}
            <strong className="font-bold">U</strong> output from before, into
            the <strong className="font-bold">Mix</strong> node&apos;s node{" "}
            <strong className="font-bold">factor</strong> input.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> Removed the UV node? You
            can add it back from the Library panel, or by right clicking on the
            workspace.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: edgeExistsBetween("uv:out_u", "mix:factor"),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now we have a gradient like before, but in color! We can use the Mix
            node to blend between any two images, not just colors. Let&apos;s
            finish up by using a few more nodes to create a fun lava effect.
          </p>
          <p>
            First, we&apos;ll change the colors to look like lava. Change the
            <strong className="font-bold"> blue</strong> color, input{" "}
            <strong className="font-bold">B</strong> in the Mix node to a bright{" "}
            <strong className="font-bold">orange-yellow</strong>.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => {
        if (n.data.type !== "mix") return false;

        const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
        const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

        const firstIsRed = r1 > 0.8 && g1 < 0.2 && b1 < 0.2;
        const secondIsYellow = r2 > 0.8 && g2 > 0.6 && b2 < 0.2;

        return firstIsRed && secondIsYellow;
      }),
    },
    {
      title: "Noise",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Next, we&apos;ll change our gradient to something a little more
            interesting. Find the{" "}
            <strong className="font-bold">Voronoi noise</strong> node under{" "}
            <strong className="font-bold">Generate</strong> in the Library panel
            and add one.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => n.data.type === "voronoi_noise"),
    },
    {
      title: "Noise",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the <strong className="font-bold">voronoi noise</strong>
            &apos;s <strong className="font-bold">noise</strong> output to the{" "}
            <strong className="font-bold">Mix</strong> node&apos;s{" "}
            <strong className="font-bold">Factor</strong> input.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: edgeExistsBetween("voronoi_noise:output", "mix:factor"),
    },

    {
      title: "Almost there",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Let&apos;s add another gradient by blending the result with a third
            color.
          </p>
          <p>
            Add a <strong className="font-bold">new</strong> Mix node, and{" "}
            <strong className="font-bold">connect</strong> the output from the{" "}
            <strong className="font-bold">first</strong> one to the{" "}
            <strong className="font-bold">A input</strong> of the new one.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can find the Mix
            node under the <strong className="font-bold">blend</strong>{" "}
            category.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can create a new
            node from an existing one. Click the <LuEllipsisVertical /> menu
            icon on a node and select{" "}
            <strong className="font-bold">Duplicate</strong>.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: edgeExistsBetween("mix:output", "mix:input_a"),
    },
    {
      title: "Mixing images",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>Now make the color in the second input a bright orange.</p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => {
          if (n.data.type !== "mix") return false;

          const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
          const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

          const firstIsRed = r1 > 0.8 && g1 < 0.2 && b1 < 0.2;
          const secondIsOrange = r2 > 0.8 && g2 > 0.5 && b2 < 0.2;

          return !firstIsRed && secondIsOrange;
        }),
      ),
    },
    {
      title: "Mixing images",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Finally, connect the <strong className="font-bold">V</strong> output
            from the UV node to the <strong className="font-bold">new</strong>{" "}
            Mix node&apos;s <strong className="font-bold">Factor</strong> input.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        edgeExistsBetween("mix:output", "mix:input_a"),
        edgeExistsBetween("uv:out_v", "mix:factor"),
      ),
    },
    {
      title: "Mixing images",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            And now the <strong className="font-bold">new</strong> Mix
            node&apos;s output, right side, to to the{" "}
            <strong className="font-bold">output</strong> node&apos;s{" "}
            <strong className="font-bold">Layer output</strong>.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        edgeExistsBetween("mix:output", "mix:input_a"),
        edgeExistsBetween("mix:output", "__output:color"),
        edgeExistsBetween("uv:out_v", "mix:factor"),
      ),
    },
    {
      title: "Tutorial Completed",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            That&apos;s the end of the basics! You&apos;ve learned to create
            nodes, connect them together and build effects. These are all the
            tools you need to start creating! Try out different types of nodes
            and ways of connecting them, add some images, and see how things fit
            together. Node thing is built around a minimal set of tools (nodes
            and connections, that&apos;s it!) that combine to create complex
            effects.
          </p>
        </div>
      ),
      transparentBackground: true,
    },
  ],
};
