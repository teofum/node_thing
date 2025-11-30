import { clsx } from "clsx";
import {
  LuHistory,
  LuCircleCheckBig,
  LuCircleOff,
  LuArrowRight,
  LuRedo2,
  LuUndo2,
} from "react-icons/lu";

import { Button } from "@/ui/button";
import { useProjectStore } from "@/store/project.store";
import { Command } from "@/store/types/command";

const getCommandLabel = (cmd: Command): string => {
  switch (cmd.command) {
    // TODO
    // case "createNode":
    //   return `Create Node: ${cmd.data.node?.data?.type || "Unknown"}`;
    // case "removeNode":
    //   return "Remove Node";
    // case "nodesChange":
    //   const type = cmd.data.patch?.type;
    //   return type === "position" ? "Move Node" : `Modify Node (${type})`;
    // case "edgeChanges":
    //   return "Connect/Disconnect";
    // case "updateNodeDefaultValue":
    //   return `Update Input: ${cmd.data.input}`;
    // case "updateNodeUniforms":
    //   return `Update Uniform: ${cmd.data.name}`;
    // case "switchLayer":
    //   return "Switch Layer";
    // case "addLayer":
    //   return "Add Layer";
    // case "removeLayer":
    //   return "Remove Layer";
    // case "renameLayer":
    //   return "Rename Layer";
    // case "duplicateLayer":
    //   return "Duplicate Layer";
    // case "reorderLayer":
    //   return "Reorder Layers";
    // case "setCanvasSize":
    //   return "Resize Canvas";
    // case "setLayerBounds":
    //   return "Move Layer";
    // case "importLayer":
    //   return "Import Layer";
    // case "modifyNode":
    //   return "Edit Node Settings";
    default:
      return cmd.command;
  }
};

export function MenuHistory() {
  const history = useProjectStore((state) => state.history);
  const done = useProjectStore((state) => state.done);
  const goTo = useProjectStore((state) => state.goTo);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);

  return (
    <div className="group border-t border-white/15 flex flex-col h-full text-white select-none">
      <div className="grow overflow-y-auto min-h-0 border-b border-white/15 custom-scrollbar transition-opacity duration-300 opacity-80 group-hover:opacity-100">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
            <LuHistory className="w-8 h-8 opacity-50" />
            <span className="text-xs">No history yet</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {history.map((cmd, index) => {
              const isUndone = index < done;
              const isActive = index === done;

              return (
                <div
                  key={index}
                  onClick={() => goTo(index)}
                  className={clsx(
                    "group flex items-center justify-between px-3 py-3 text-xs border-b border-white/5 cursor-pointer transition-colors duration-150",
                    isActive
                      ? "bg-teal-400/10 text-white"
                      : "hover:bg-white/8 text-neutral-300",
                    isUndone && "opacity-50 hover:opacity-80",
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={clsx(
                        "shrink-0 w-4 h-4 flex items-center justify-center rounded-full border",
                        isActive
                          ? "border-teal-400 text-teal-400 bg-teal-400/20"
                          : "border-transparent text-white/20 transition-colors",
                      )}
                    >
                      {isActive && <LuArrowRight className="w-3 h-3" />}
                      {!isActive && !isUndone && (
                        <LuCircleCheckBig className="w-3 h-3 text-green-500/80" />
                      )}
                      {isUndone && <LuCircleOff className="w-3 h-3" />}
                    </div>
                    <span className="truncate font-medium">
                      {getCommandLabel(cmd)}
                    </span>
                  </div>
                  {isUndone && (
                    <span className="text-[10px] uppercase tracking-wider text-white/20 font-bold ml-2">
                      Redo
                    </span>
                  )}
                </div>
              );
            })}

            <div
              onClick={() => goTo(history.length)}
              className={clsx(
                "group flex items-center gap-3 px-3 py-3 text-xs cursor-pointer hover:bg-white/8 transition-colors",
                done === history.length
                  ? "bg-teal-400/10 text-white"
                  : "text-neutral-500",
              )}
            >
              <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                {done === history.length ? (
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
              </div>
              <span className="italic">Initial State</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 flex gap-2">
        <Button
          variant="outline"
          onClick={undo}
          disabled={history.length - done <= 0}
          className="flex-1 gap-2"
          title="Undo (Ctrl+Z)"
        >
          <LuUndo2 className="w-3.5 h-3.5" />
          Undo
        </Button>
        <Button
          variant="outline"
          onClick={redo}
          disabled={done <= 0}
          className="flex-1 gap-2"
          title="Redo (Ctrl+Y)"
        >
          Redo
          <LuRedo2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
