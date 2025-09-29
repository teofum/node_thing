fn get_index(x: i32, y: i32, w: i32, h: i32) -> vec3f {
    let clampedX = clamp(x, 0, w - 1);
    let clampedY = clamp(y, 0, h - 1);
    let index = u32(clampedX + clampedY * w);
    return raw_input[index];
}

fn get_lum(test: vec3f) -> f32 {
    return 0.2126 * test.r + 0.7152 * test.g + 0.0722 * test.b;
}

const PI = 3.1415926538;

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let kernel_size: i32 = i32(floor(std_dev * 3.0));

    var out = input;
    for (var dy: i32 = -kernel_size; dy <= kernel_size; dy += 1) {
        for (var dx: i32 = -kernel_size; dx <= kernel_size; dx += 1) {
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let sample_index: u32 = u32(x) + u32(y) * u.width;

            if get_lum(raw_input[sample_index]) >= threshold {
                let dx_f = f32(dx);
                let dy_f = f32(dy);
                let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(dx_f * dx_f + dy_f * dy_f) / (2.0 * std_dev * std_dev));

                let c = raw_input[sample_index];
                let modify = c * gaussian_v;
                out = clamp(out + modify, vec3f(0.0), vec3f(1.0));
            }
        }
    }

    output[index] = out;
}
