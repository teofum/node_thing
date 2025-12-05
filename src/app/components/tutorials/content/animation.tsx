import { useConfigStore } from "@/store/config.store";
import { Tutorial } from "@/store/tutorial.store";
import {
  nodeExists,
  edgeExistsBetween,
  and,
  inLayer,
  layerExists,
} from "../helpers";

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
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora
            nemo dolore voluptatum unde, quasi in ipsa fugiat soluta labore nam
            quis voluptatibus itaque commodi! Odio id qui nihil repellat porro!
          </p>
        </div>
      ),
    },
    /// end
  ],
};
