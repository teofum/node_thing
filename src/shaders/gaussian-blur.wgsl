@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_KERNEL_SIZE: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;


//const kernelSize: i32 = 8;


@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var fKERNEL_SIZE: f32;
    if arrayLength(&in_KERNEL_SIZE) <= 4u {
        fKERNEL_SIZE = in_KERNEL_SIZE[0];
    } else {
        fKERNEL_SIZE = in_KERNEL_SIZE[index];
    }
    let kernelSize: i32 = i32(floor(fKERNEL_SIZE*20))+1;

    var out: vec3<f32> = vec3<f32>(0.0);

    var intensity: f32 = 0.0;
    const SIGMA = 8.0;
    const PI = 3.1415926538;
 
    for(var dy: i32 = -kernelSize; dy <= kernelSize; dy += 1){
        for(var dx: i32 = -kernelSize; dx <= kernelSize; dx += 1){
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let sampleIndex: u32 = u32(x) + u32(y) * u.width;

            let dx_f = f32(dx);
            let dy_f = f32(dy);
            let gaussian_v = 1.0 / (2.0 * PI * SIGMA * SIGMA) * exp(-(dx_f * dx_f + dy_f * dy_f) / (2.0 * SIGMA * SIGMA));
            let c = input[sampleIndex];
            out += c * gaussian_v;
            intensity += gaussian_v;
        }
    }

    out /= intensity;

    output[index] = out;
}