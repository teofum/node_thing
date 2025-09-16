const UNIFORM_BUFFER_SIZE = 5 * 4; // 5 * u32 (width, height, x, y, has_alpha)

function createUniformBuffer(device: GPUDevice) {
  return device.createBuffer({
    size: UNIFORM_BUFFER_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

function createUniformBindGroupLayout(device: GPUDevice) {
  return device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "uniform" },
      },
    ],
  });
}

function createUniformBindGroup(
  device: GPUDevice,
  layout: GPUBindGroupLayout,
  buffer: GPUBuffer,
) {
  return device.createBindGroup({
    layout,
    entries: [{ binding: 0, resource: { buffer } }],
  });
}

export function createUniform(device: GPUDevice) {
  const buffer = createUniformBuffer(device);
  const bindGroupLayout = createUniformBindGroupLayout(device);
  const bindGroup = createUniformBindGroup(device, bindGroupLayout, buffer);

  return { buffer, bindGroupLayout, bindGroup };
}
