@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_RANGE: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

//const RANGE : i32 = 4; //color amount

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var fRANGE: f32;
    if arrayLength(&in_RANGE) <= 4u {
        fRANGE = in_RANGE[0];
    } else {
        fRANGE = in_RANGE[index];
    }
    let RANGE: i32 = i32(floor(fRANGE*10))+2; 

    let luminance = 0.2126 * input[index].r + 0.7152 * input[index].g + 0.0722 * input[index].b;

    let steps: f32 = f32(RANGE);

    let r = floor(input[index].r * steps) / (steps - 1.0);
    let g = floor(input[index].g * steps) / (steps - 1.0);
    let b = floor(input[index].b * steps) / (steps - 1.0);

    output[index] = vec3<f32>(r, g, b);
    return;
}
