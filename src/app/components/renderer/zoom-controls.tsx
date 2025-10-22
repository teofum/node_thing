import { RefObject, useCallback, useLayoutEffect } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

import { useConfigStore } from "@/store/config.store";
import { ProjectProperties } from "@/store/project.types";
import { Button } from "@/ui/button";

const ZOOM_STOPS = [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8];
const ZOOM_SPEED = 0.01;

type ZoomControlsProps = {
  viewport: RefObject<HTMLDivElement | null>;
  canvas: ProjectProperties["canvas"];
  storeHydrated: boolean;
};

export function ZoomControls({
  viewport,
  canvas,
  storeHydrated,
}: ZoomControlsProps) {
  const view = useConfigStore((s) => s.view);
  const updateView = useConfigStore((s) => s.updateView);

  const setZoom = useCallback(
    (zoom: number) => updateView({ zoom }),
    [updateView],
  );

  const zoomIn = () => {
    setZoom(
      ZOOM_STOPS.find((stop) => stop > view.zoom) ?? ZOOM_STOPS.at(-1) ?? 1,
    );
  };

  const zoomOut = () => {
    setZoom(ZOOM_STOPS.findLast((stop) => stop < view.zoom) ?? ZOOM_STOPS[0]);
  };

  const fit = () => {
    if (!viewport.current) return;

    const vzoom =
      ((viewport.current.clientHeight - 32) / canvas.height) *
      window.devicePixelRatio;
    const hzoom =
      ((viewport.current.clientWidth - 32) / canvas.width) *
      window.devicePixelRatio;
    setZoom(Math.min(vzoom, hzoom));
  };

  useLayoutEffect(() => {
    const zoomScrollHandler = (ev: WheelEvent) => {
      if (!ev.ctrlKey) return;

      ev.preventDefault();
      ev.stopPropagation();

      const zoom = view.zoom * (1 - ev.deltaY * ZOOM_SPEED);
      setZoom(Math.max(ZOOM_STOPS[1], Math.min(ZOOM_STOPS.at(-1) ?? 1, zoom)));
    };

    const viewportEl = viewport.current;
    viewportEl?.addEventListener("wheel", zoomScrollHandler, {
      passive: false,
    });

    return () => {
      viewportEl?.removeEventListener("wheel", zoomScrollHandler);
    };
  }, [setZoom, view.zoom, storeHydrated, viewport]);

  return (
    <div className="flex flex-row">
      <Button
        icon
        variant="outline"
        className="rounded-r-none"
        onClick={zoomOut}
      >
        <LuMinus />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-r-0 border-l-0 rounded-none"
        onClick={fit}
      >
        {(view.zoom * 100).toFixed(0)}%
      </Button>
      <Button
        icon
        variant="outline"
        className="rounded-l-none"
        onClick={zoomIn}
      >
        <LuPlus />
      </Button>
    </div>
  );
}
