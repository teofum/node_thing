import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import { nodeExists, edgeExistsBetween, and } from "../helpers";

// TODO: set canvas size to 300x100

export const ditheringIntro: Tutorial = {
  id: "dithering",
  name: "Dithering introduction",
  description: "Learn the basics of dithering using Node Thing",
  steps: [
    {
      title: "Welcome to dithering!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            This tutorial will be different from the previous ones, mainly
            because it&apos;s about a specific technique rather than a feature
            or tech specific of Node Thing.
          </p>
          <p>In this tutorial you will learn about Dithering.</p>
        </div>
      ),
    },
    {
      title: "Welcome to dithering!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Dithering is a technique used to create the illusion of more colors
            or shades than a system can actually display. It works by arranging
            tiny dots of different colors or brightness levels in patterns so
            that, from a distance, the human eye blends them together into
            smoother tones.
          </p>
          <p>
            In the past, dithering was especially useful on early computers,
            printers, and video game systems that had very limited color
            palettes. It allowed artists and developers to simulate gradients,
            shadows, and detailed images even when only a handful of colors were
            available.
          </p>
        </div>
      ),
    },
    {
      title: "Get a gradient going",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>To begin, let&apos;s first get an image going.</p>
          <p>
            Place an <strong className="font-bold">UV</strong> node from the
            input section and connect the{" "}
            <strong className="font-bold">U</strong> output into the
            layer&apos;s output.
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
        nodeExists((n) => n.data.type === "uv"),
        edgeExistsBetween("uv:out_u", "__output:color"),
      ),
    },
    {
      title: "Reduce the number of colours",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now lets say either for stylistic choices or for hardware
            limitations we can&apos;t use all the range of colours that we see
            right now on screen (even in greyscale we have many tones of grey).
          </p>
          <p>
            Lets first apply a threshold to reduce the number of colours. Place
            a <strong className="font-bold">threshold</strong> node from the{" "}
            <strong className="font-bold">Effects</strong> section of the
            Library panel.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: nodeExists((n) => n.data.type === "threshold"),
    },
    {
      title: "Connect the threshold",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now connect the <strong className="font-bold">u</strong> coordinate
            into the threshold&apos;s input and the threshold&apos;s output to
            the layer output.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        edgeExistsBetween("uv:out_u", "threshold:input"),
        edgeExistsBetween("threshold:output", "__output:color"),
      ),
    },
    {
      title: "Excelent!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now we have successfully reduced the number of colours to 2. But in
            doing so we lost all our gradient information and detail, making it
            really hard to realize what is going on in our image.
          </p>
          <p>
            To mitigate this loss of detail we will use white noise to threshold
            the image.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      //todo, fondo trasparente
    },
    {
      title: "Add white noise",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Place a <strong className="font-bold">white noise</strong> node from
            the <strong className="font-bold">generate</strong> section and
            connect its output to the{" "}
            <strong className="font-bold">threshold</strong> input of the
            threshold node.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => n.data.type === "white_noise"),
        edgeExistsBetween("white_noise:output", "threshold:threshold"),
      ),
    },
    {
      title: "Excelent!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now we can see that a gradient seems to appear. But actually what is
            going on is that the threshold we are passing our image through is
            taking random values and therefore the brighter areas have a higher
            probability of being above the threshold. This makes it so that
            brighter areas have a higher density of white pixels.
          </p>
          <p>
            Note that we are still using just 2 colours, black and white. But we
            have managed to preserve the gradient information.
          </p>
          <p className="text-xs/4 text-white/60">
            <strong className="font-bold">Tip:</strong> if you zoom in the
            canvas you will be able to see the effect better. You can also
            reduce the canvas size to make the pixels larger with the gear icon
            on the top right of the canvas.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      //todo, fondo trasparente
    },
    {
      title: "From random to patterns",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            Now by thresholding randomly, with white noise, we are very prone to
            weird artefacts, like random white pixels in dark areas and random
            black pixels in bright areas.
          </p>
          <p>
            To solve this many people have proposed different thresholding
            patterns that attempt to preserve gradient detail or give specific
            styles.
          </p>
          <p>
            Place a <strong className="font-bold">checkers pattern</strong> node
            from the <strong className="font-bold">generate</strong> section of
            the library and connect it to the threshold input of the threshold
            node.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => n.data.type === "checkers_Pattern"),
        edgeExistsBetween("checkers_Pattern:output", "threshold:threshold"),
      ),
    },

    {
      title: "Welcome to dithering!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            This pattern now preserves the gradient but has 3 distinct sections
            instead of the random distribution of the white noise. So we
            maintain gradient information and better preserve darker and
            brighter areas.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      //todo, fondo trasparente
    },
    {
      title: "Use a Bayer 8x8 pattern",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            The next step right now would be to use a{" "}
            <strong className="font-bold">bayer 8x8 pattern</strong>. This is a
            very common pattern used for different applications, for dithering
            specifically it allows us to dither with a whopping 64 different
            step patterns or sections in our gradient.
          </p>
          <p>
            Place the <strong className="font-bold">Bayer Pattern 8x8</strong>{" "}
            node from the generate section and connect its output to the
            threshold input of the threshold node.
          </p>
        </div>
      ),
      position: { x: 250, y: 67 },
      nextCondition: and(
        nodeExists((n) => n.data.type === "bayers_Pattern_8x8"),
        edgeExistsBetween("bayers_Pattern_8x8:output", "threshold:threshold"),
      ),
    },
    {
      title: "That's all you need to start",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>
            That&apos;s all you need to know about dithering to get started.
            Feel free to experiment with whatever you want as a thresholding
            pattern and we invite you to see these effects work on pictures
            instead of just a gradient, but we&apos;ll leave that to you.
          </p>
        </div>
      ),
      //todo, fondo trasparente
    },
  ],
};
