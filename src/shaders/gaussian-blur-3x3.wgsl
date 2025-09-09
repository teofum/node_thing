
@group(0) @binding(0)
var<storage, read_write> input: array<vec4f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec4f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

const GAUSSIAN_KERNEL: array<array<f32, 3>, 3> = array<array<f32, 3>, 3>(
    array<f32, 3>(0.0625, 0.125, 0.0625),
    array<f32, 3>(0.125,  0.25,  0.125),
    array<f32, 3>(0.0625, 0.125, 0.0625),
);


@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var out: vec4<f32> = vec4<f32>(0.0);

    for(var dy: i32 = -1; dy <= 1; dy = dy + 1){
        for(var dx: i32 = -1; dx <=1; dx = dx +1){
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);

            let sampleIndex = u32(x) + u32(y) * u.width;
            out = out + input[sampleIndex] * GAUSSIAN_KERNEL[dy + 1][dx + 1];
        }
    }

    output[index] = out;
}
