const PI = 3.1415926538;

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let std_dev = inout_std_dev;
    let kernel_size = i32(floor(std_dev * 3.0));

    var out = vec3f(0.0);
    var intensity = 0.0;
    for (var dy = -kernel_size; dy <= kernel_size; dy += 1) {
        let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
        let sample_index = id.x + u32(y) * u.width;

        let dy_f = f32(dy);
        let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(dy_f * dy_f) / (2.0 * std_dev * std_dev));
        let c = raw_inout_image[sample_index];
        out += c * gaussian_v;
        intensity += gaussian_v;
    }

    out /= intensity;

    output[index] = out;
}
