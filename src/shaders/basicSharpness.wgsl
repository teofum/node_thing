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

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let x = i32(id.x);
    let y = i32(id.y);
    let w = i32(u.width);
    let h = i32(u.height);

    // Apply sharpen kernel
    let center = get_index(x, y, w, h) * 5.0;
    let up     = get_index(x, y - 1, w, h) * -1.0;
    let down   = get_index(x, y + 1, w, h) * -1.0;
    let left   = get_index(x - 1, y, w, h) * -1.0;
    let right  = get_index(x + 1, y, w, h) * -1.0;

    var color = center + up + down + left + right;

    color = clamp(color, vec3f(0.0), vec3f(1.0));

    output[index] = color;
}
