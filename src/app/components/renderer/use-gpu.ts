import { useEffect, useState } from "react";

export function useGPU() {
  const [device, setDevice] = useState<GPUDevice | null>(null);

  /*
   * Initialize GPU device on component init
   */
  useEffect(() => {
    async function initWebGPUDevice() {
      if (!navigator.gpu) throw new Error("webgpu not supported");

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error("couldn't get adapter");

      const device = await adapter.requestDevice();
      device.lost.then(({ reason }) => {
        // On device lost, reinitialize
        console.warn(`WebGPU device lost: ${reason}`);
        if (reason !== "destroyed") initWebGPUDevice();
      });

      setDevice(device);
    }
    initWebGPUDevice();
  }, []);

  return device;
}
