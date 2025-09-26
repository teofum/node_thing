@group(0) @binding(0)
var<storage, read_write> output: array<f32>;

struct Uniforms {
    width: u32,
    height: u32,
};

@group(1) @binding(0)
var<uniform> u: Uniforms;

const CHECKER_GRAYSCALE: array<f32, 4> = array<f32, 4>( 
    0.25, 0.75, 
    0.75, 0.25
);

@compute @workgroup_size(16, 16)
fn main( @builtin(global_invocation_id) id: vec3u,) {
    // Avoid accessing the buffer out of bounds
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    output[index] = CHECKER_GRAYSCALE[(id.x % 2) + ((id.y % 2) * 2)];
}

