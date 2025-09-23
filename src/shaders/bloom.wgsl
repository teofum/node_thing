@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_std_dev: array<f32>;

@group(0) @binding(2)
var<storage, read> in_threshold: array<f32>;

@group(0) @binding(3)
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

fn get_lum(test: vec3f) -> f32 {
    return 0.2126 * test.r + 0.7152 * test.g + 0.0722 * test.b;
}

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
    let kernel_size: i32 = i32(floor(std_dev * 3.0));

    var threshold: f32;
    if arrayLength(&in_threshold) <= 4u {
        threshold = in_threshold[0];
    } else {
        threshold = in_threshold[index];
    }

    var out = input[index];
    for (var dy: i32 = -kernel_size; dy <= kernel_size; dy += 1) {
        for (var dx: i32 = -kernel_size; dx <= kernel_size; dx += 1) {
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let sampleIndex: u32 = u32(x) + u32(y) * u.width;

            if get_lum(input[sampleIndex]) >= threshold {
                let dx_f = f32(dx);let dy_f = f32(dy);
                let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(dx_f * dx_f + dy_f * dy_f) / (2.0 * std_dev * std_dev));

                let c = input[sampleIndex];
                let modify = c * gaussian_v;
                out = clamp(out + modify, vec3f(0.0), vec3f(1.0));
            }
        }
    }

    output[index] = out;
}
