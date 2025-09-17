
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

const RANGE : i32 = 9; //color amount

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let luminance = 0.2126 * input[index].r + 0.7152 * input[index].g + 0.0722 * input[index].b;

    let step: f32 = 1/f32(RANGE);

    for (var i: f32 = 0.0 ; i < 1.0 ; i += step) {
        if( luminance < i ){
            output[index] = vec3f(i);
            return;
        }
    }
    return;
}
