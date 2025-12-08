import { useEffect, useRef, useState } from "react";

export function useGPU() {
  const [device, setDevice] = useState<GPUDevice | null>(null);

  const n = useRef(1);

  /*
   * Initialize GPU device on component init
   */
  useEffect(() => {
    async function initWebGPUDevice() {
      if (!navigator.gpu) throw new Error("webgpu not supported");

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error("couldn't get adapter");

      const device = await adapter.requestDevice({
        label: `device ${n.current++}`,
      });

      device.lost.then(({ reason }) => {
        // On device lost, reinitialize
        console.warn(`WebGPU device (${device.label}) lost: ${reason}`);
        if (reason !== "destroyed") initWebGPUDevice();
      });

      setDevice(device);
    }
    initWebGPUDevice();
  }, []);

  return device;
}
