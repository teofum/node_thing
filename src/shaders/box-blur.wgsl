@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_kernel_size: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var kernel_size: f32;
    if arrayLength(&in_kernel_size) <= 4u {
        kernel_size = in_kernel_size[0];
    } else {
        kernel_size = in_kernel_size[index];
    }

    let R: i32 = i32(floor(kernel_size));

    var sum: vec3f = vec3f(0.0);
    for (var dy: i32 = -R; dy <= R; dy = dy + 1) {
        for (var dx: i32 = -R; dx <= R; dx = dx + 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);

            let sampleIndex = u32(x) + u32(y) * u.width;
            sum = sum + input[sampleIndex];
        }
    }

    let avg = sum / f32((2 * R + 1) * (2 * R + 1));

    output[index] = avg;
}
