import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import { nodeExists, edgeExistsBetween, and } from "../helpers";
import { LuTimer } from "react-icons/lu";

export const animationIntro: Tutorial = {
  id: "animation",
  name: "Animation introduction",
  description: "A simple tutorial to explore animation controls",
  steps: [
    {
      title: "Welcome to animations!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Node thing allows you to use a functionality called animations, this
            allows you to use a time value that can be controlled in different
            ways. With this you can give life to your effects and make them
            evolve across time.
          </p>
          <p>
            First we will see how to use the time node and the basic controls.
          </p>
        </div>
      ),
    },
    {
      title: "Time node",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Place a time node, you can fid it in the input section of the
            library panel
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
      nextCondition: nodeExists((n) => n.data.type === "time"),
    },
    {
      title: "Time node output",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the output of the time node to the layer&apos;s output.
          </p>
          <p>
            This will turn the time nodes output, which is a number, and display
            it as a grayscale on the screen.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: edgeExistsBetween("time:output", "__output:color"),
    },
    {
      title: "Time controls",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            This is the animation control panel, here you will access the
            animation controls. With these you can play, stop, rewind, set
            loops, adjust animation duration, change playback speed, choose a
            framerate limit and export the animation.
          </p>
          <p>Try pressing the play button.</p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also access some
            of these from the animation menu at the top of your screen.
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
              panel: "animation",
            },
          },
        });
      },
      //nextCondition: (s) => (useAnimationStore.getState().time > 1), //TODO
    },
    {
      title: "Time controls",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            That was pretty fast, try slowing it down by setting the animation
            speed to 0.5 speed.
          </p>
          <p>And then try playing again.</p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also access some
            of these from the animation menu at the top of your screen.
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
              panel: "animation",
            },
          },
        });
      },
      //nextCondition: (s) => (useAnimationStore.getState().speed === 0.5), //TODO
    },
    {
      title: "More interesting things",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now this animation really doesn&apos;t do much after passing value
            1, lets try to change that.
          </p>
          <p>
            Start by placing a sine node from the math section in the library
            panel. Connect the time into the sine&apos;s t input and the
            sine&apos;s output into the layers output.
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
        nodeExists((n) => n.data.type === "sine"),
        edgeExistsBetween("time:output", "sine:t"),
        edgeExistsBetween("sine:output", "__output:color"),
      ),
    },
    {
      title: "More interesting things",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now when you play you can see that as the time goes up it will
            oscillate between black and white according to the sine function.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      //nextCondition: (s) => (useAnimationStore.getState().time > 1), //TODO
    },
    {
      title: "Excellent!!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>Now we will use this to blend two different colors.</p>
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

        const firstIsRed = r1 > 0.8 && g1 < 0.2 && b1 < 0.2;
        const secondIsBlue = r2 < 0.2 && g2 < 0.2 && b2 > 0.8;

        return firstIsRed && secondIsBlue;
      }),
    },
    {
      title: "More interesting things",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the sine&apos;s output into the mix&apos;s factor and
            connect the mix&apos;s output to the layer&apos;s output.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        edgeExistsBetween("time:output", "sine:t"),
        edgeExistsBetween("sine:output", "mix:factor"),
        edgeExistsBetween("mix:output", "__output:color"),
      ),
    },
    {
      title: "More interesting things",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Some nodes have been made with a built in animation in mind, these
            usually have a t input specifically for that.
          </p>
          <p>
            Place a voronoi noise node from the generate section of the library.
            Connect the time node&apos;s output into the t input of the voronoi
            node and then the voronoi&apos;s output into the layer&apos;s
            output.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> You can also add nodes
            by <strong className="font-bold">right clicking</strong> anywhere in
            the workspace!
          </p>
          <p className="text-xs/4 text-white/60">
            At this point you can delete the mix and sine nodes if you want to.
            You can do this with backspace or the node options.
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
        edgeExistsBetween("time:output", "voronoi_noise:t"),
        edgeExistsBetween("voronoi_noise:output", "__output:color"),
        //(s) => (useAnimationStore.getState().time > 1), //TODO
      ),
    },
    {
      title: "Thats it!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            That&apos;s all you need to know about the animation functionality
            of Node Thing. Remember you can export these animations with various
            settings. Feel free to experiment with this in however way you see
            fit.
          </p>
          <p>
            You can also use the timeline function on the canvas to the right of
            your screen by pressing the clock icon on the top of the canvas.
          </p>
          <LuTimer />
        </div>
      ),
    },
    /// end
  ],
};
