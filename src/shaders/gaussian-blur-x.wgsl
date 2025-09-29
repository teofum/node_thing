@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_std_dev: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

@group(0) @binding(3)
var<storage, read_write> out_std_dev: array<f32>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

const PI = 3.1415926538;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var std_dev: f32;
    if arrayLength(&in_std_dev) <= 4u {
        std_dev = in_std_dev[0];
    } else {
        std_dev = in_std_dev[index];
    }

    // Make the kernel three standard deviations in size
    let kernel_size = i32(floor(std_dev * 3.0));

    var out = vec3f(0.0);

    var intensity = 0.0;

    for (var dx = -kernel_size; dx <= kernel_size; dx += 1) {
        let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
        let sample_index = u32(x) + id.y * u.width;

        let dx_f = f32(dx);
        let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(dx_f * dx_f) / (2.0 * std_dev * std_dev));
        let c = input[sample_index];
        out += c * gaussian_v;
        intensity += gaussian_v;
    }

    out /= intensity;

    output[index] = out;
    out_std_dev[index] = std_dev;
}
