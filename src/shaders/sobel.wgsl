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

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let luma = vec3f(0.2126, 0.7152, 0.0722);

    var result: vec3f = vec3f(0.0);
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let idx = u32(x) + u32(y) * u.width;

            let weight_x = f32(-dx) * f32(2 - abs(dy));
            let weight_y = f32(-dy) * f32(2 - abs(dx));

            result += vec3f(
              dot(luma, input[idx]) * weight_x,
              dot(luma, input[idx]) * weight_y,
              0.0,
            );
        }
    }

    output[index] = result;
}
