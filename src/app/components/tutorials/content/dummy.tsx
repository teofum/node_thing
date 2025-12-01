import { Tutorial } from "@/store/tutorial.store";

export const dummy: Tutorial = {
  id: "dummy",
  name: "Dummy",
  description: "TODO remove, for UI design",
  steps: [
    {
      // TODO, added for UI design
      title: "Hi!",
      content: (
        <div className="flex flex-col gap-3 text-sm/4">
          <p>TODO</p>
        </div>
      ),
    },
  ],
};
