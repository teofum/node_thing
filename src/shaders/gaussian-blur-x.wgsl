const PI = 3.1415926538;

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let kernel_size = i32(floor(std_dev * 3.0));

    var out = vec3f(0.0);
    var intensity = 0.0;
    for (var dx = -kernel_size; dx <= kernel_size; dx += 1) {
        let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
        let sample_index = u32(x) + id.y * u.width;

        let dx_f = f32(dx);
        let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(dx_f * dx_f) / (2.0 * std_dev * std_dev));
        let c = raw_input[sample_index];
        out += c * gaussian_v;
        intensity += gaussian_v;
    }

    out /= intensity;

    inout_image[index] = out;
    inout_std_dev[index] = std_dev;
}
