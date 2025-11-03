"use client";

import { ShaderNode } from "@/schemas/node.schema";
import { useConfigStore } from "@/store/config.store";
import { Project } from "@/store/project.types";
import {
  Tutorial as TutorialType,
  useTutorialStore,
} from "@/store/tutorial.store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { LuEllipsisVertical } from "react-icons/lu";

function nodeExists(fn: (node: ShaderNode) => boolean) {
  return (p: Project) => p.layers[p.currentLayer].nodes.some(fn);
}

function edgeExistsBetween(
  source: `${string}:${string}`,
  target: `${string}:${string}`,
) {
  return (p: Project) => {
    const { nodes, edges } = p.layers[p.currentLayer];
    return edges.some((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);

      const [sourceType, sourceHandle] = source.split(":");
      const [targetType, targetHandle] = target.split(":");

      return (
        s?.data.type === sourceType &&
        t?.data.type === targetType &&
        e.sourceHandle === sourceHandle &&
        e.targetHandle === targetHandle
      );
    });
  };
}

function and(...fns: ((p: Project) => boolean)[]) {
  return (p: Project) => fns.every((fn) => fn(p));
}

function or(...fns: ((p: Project) => boolean)[]) {
  return (p: Project) => fns.some((fn) => fn(p));
}

function not(fn: (p: Project) => boolean) {
  return (p: Project) => !fn(p);
}

const testTutorial: TutorialType = {
  name: "Test tutorial",
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
      title: "The Library panel",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You can find all the different nodes, grouped by use, in the{" "}
            <strong className="font-bold">Library panel</strong>. Let&apos;s
            open it now.
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
            Find the <strong className="font-bold">UV</strong> node in the
            Library panel and drag it onto the workspace.
          </p>

          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also add nodes
            by <strong className="font-bold">right clicking</strong> anywhere in
            the workspace!
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
            them. Nodes have <strong className="font-bold">inputs</strong> on
            the left side, and <strong className="font-bold">outputs</strong> on
            the right.
          </p>
          <p>
            To create effects, we will connect outputs to inputs. You can create
            new connections by{" "}
            <strong className="font-bold">clicking and dragging</strong> an
            output to an input, or the other way around.
          </p>
          <p>
            The <strong className="font-bold">Output</strong> node, highlighted
            in purple, is a special node that{" "}
            <strong className="font-bold">displays its inputs on screen</strong>
            . That means it&apos;s the final stop for all your connections.
          </p>
          <p>
            Now try connecting the <strong className="font-bold">U</strong>{" "}
            output on the UV node you just created to the output node&apos;s{" "}
            <strong className="font-bold">Layer output</strong> input.
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
            panel. Try adding one now, and connect it to the output.
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
        nodeExists((n) => n.data.type === "mix"),
        edgeExistsBetween("mix:output", "__output:color"),
      ),
    },
    {
      title: "Default values",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            You&apos;ll see the Mix node we just added has multiple inputs.
            Right now, they&apos;re not connected to anything. When inputs are
            disconnected, you can set their value manually.
          </p>
          <p>
            Try setting the first color to a bright red, and the second color to
            a bright blue. You should see a purple color in the canvas as red
            and blue mix together.
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
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Great! You can change the mix ratio of each color with the{" "}
            <strong className="font-bold">Factor</strong> input. Try connecting
            the UV node&apos;s <strong className="font-bold">U</strong> output
            from before to it.
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
            blue color in the Mix node to a bright orange-yellow.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => {
        if (n.data.type !== "mix") return false;

        const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
        const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

        const firstIsRed = r1 > 0.8 && g1 < 0.1 && b1 < 0.1;
        const secondIsYellow = r2 > 0.8 && g2 > 0.6 && b2 < 0.1;

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
            <strong className="font-bold">Voronoi noise</strong> node under
            Generate in the Library panel and add one, then connect it to the
            Mix node&apos;s <strong className="font-bold">Factor</strong> input.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => n.data.type === "voronoi_noise"),
        edgeExistsBetween("voronoi_noise:output", "mix:factor"),
      ),
    },
    {
      title: "Mixing images",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Finally, let&apos;s add another gradient by blending the result with
            a third color. Add a new Mix node, and connect the output from the
            first one to its <strong className="font-bold">A</strong> input.
            Make the color in the second input a bright orange.
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
      nextCondition: and(
        nodeExists((n) => {
          if (n.data.type !== "mix") return false;

          const [r1, g1, b1] = n.data.defaultValues.input_a as number[];
          const [r2, g2, b2] = n.data.defaultValues.input_b as number[];

          const firstIsRed = r1 > 0.8 && g1 < 0.1 && b1 < 0.1;
          const secondIsOrange = r2 > 0.8 && g2 > 0.5 && b2 < 0.1;

          return !firstIsRed && secondIsOrange;
        }),
        edgeExistsBetween("mix:output", "mix:input_a"),
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
    },
  ],
};

export function Tutorial() {
  const { tutorial, step } = useTutorialStore();
  const currentStep = useTutorialStore((s) => s.tutorial?.steps[s.step]);
  const start = useTutorialStore((s) => s.startTutorial);
  const end = useTutorialStore((s) => s.endTutorial);
  const next = useTutorialStore((s) => s.nextStep);

  return (
    <>
      <div className="fixed top-2 right-2 bg-pink-400 text-black rounded-xl p-4 z-1000">
        <div>tutorials go here wip ui</div>
        <Button variant="outline" onClick={() => start(testTutorial)}>
          Start tutorial
        </Button>
        <div>active tutorial: {tutorial?.name ?? "none"}</div>
        <div>step: {step}</div>
      </div>

      <Dialog
        modal={currentStep?.nextCondition === undefined}
        trigger={null}
        open={tutorial !== null}
        onOpenChange={(open) => open || end()}
        title={currentStep?.title}
        description={`${step + 1} of ${tutorial?.steps.length}`}
        onInteractOutside={(ev) => ev.preventDefault()}
        className="select-none"
        style={{
          top: currentStep?.position?.y,
          left: currentStep?.position?.x,
          translate: currentStep?.position ? "none" : undefined,
          maxWidth: currentStep?.maxWidth ?? 480,
        }}
      >
        <div className="p-3">{currentStep?.content}</div>
        {currentStep && !currentStep.nextCondition ? (
          <div className="p-3 flex flex-row gap-2 justify-end items-end border-t border-white/15">
            <Button variant="outline" onClick={next}>
              Continue
            </Button>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
