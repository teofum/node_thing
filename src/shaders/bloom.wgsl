@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

fn get_index(x: i32, y: i32, w: i32, h: i32) -> vec3f {
    let clampedX = clamp(x, 0, w - 1);
    let clampedY = clamp(y, 0, h - 1);
    let index = u32(clampedX + clampedY * w);
    return input[index];
}

const kernelSize: i32 = 10;
const threshhold: f32 = 0.8;

fn get_lum(test: vec3f) -> f32 {
    return 0.2126 * test.r + 0.7152 * test.g + 0.0722 * test.b;;
}

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    const SIGMA = 8.0; // standard deviation of gaussian (creo)
    const PI = 3.1415926538;
 
    var out: vec3f = input[index];

    for(var dy: i32 = -kernelSize; dy <= kernelSize; dy += 1){
        for(var dx: i32 = -kernelSize; dx <= kernelSize; dx += 1){
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let sampleIndex: u32 = u32(x) + u32(y) * u.width;

            if(get_lum(input[sampleIndex])>=threshhold){
                let dx_f = f32(dx);let dy_f = f32(dy);
                let gaussian_v = 1.0 / (2.0 * PI * SIGMA * SIGMA) * exp(-(dx_f * dx_f + dy_f * dy_f) / (2.0 * SIGMA * SIGMA));

                let c = input[sampleIndex];
                let modify = c * gaussian_v;
                out = clamp(out + modify, vec3f(0.0), vec3f(1.0));
            }
        }
    }
    output[index] = out;    
}
