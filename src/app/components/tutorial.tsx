"use client";

import { useConfigStore } from "@/store/config.store";
import {
  Tutorial as TutorialType,
  useTutorialStore,
} from "@/store/tutorial.store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

const testTutorial: TutorialType = {
  name: "Test tutorial",
  steps: [
    {
      title: "Welcome to node thing!",
      content: (
        <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-3">
          <p>
            The <strong className="font-bold">UV</strong> node is an{" "}
            <strong className="font-bold">input node</strong> that outputs each
            pixel&apos;s position in the canvas as two numbers.
          </p>
          <p>
            Find the <strong className="font-bold">UV</strong> node in the
            Library panel and drag it onto the workspace.
          </p>

          <p className="text-sm text-white/60">
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
      nextCondition: (p) =>
        p.layers[p.currentLayer].nodes.some((n) => n.data.type === "uv"),
    },
    {
      title: "Connecting nodes",
      content: (
        <div className="flex flex-col gap-3">
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
            Now try connecting the{" "}
            <strong className="font-bold">&quot;u&quot;</strong> output on the
            UV node you just created to the output node&apos;s{" "}
            <strong className="font-bold">Layer output</strong> input.
          </p>
        </div>
      ),
      position: { x: 100, y: 67 },
      maxWidth: 640,
      nextCondition: (p) => {
        const { nodes, edges } = p.layers[p.currentLayer];
        return edges.some((e) => {
          const source = nodes.find((n) => n.id === e.source);
          const target = nodes.find((n) => n.id === e.target);

          return (
            source?.data.type === "uv" &&
            target?.data.type === "__output" &&
            e.sourceHandle === "out_u" &&
            e.targetHandle === "color"
          );
        });
      },
    },
    {
      title: "Congratulations",
      content: "you are the node master now",
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
