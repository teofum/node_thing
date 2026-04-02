const PI = 3.1415926538;

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let kernel_size = i32(floor(std_dev * 3.0));

    var out = vec3f(0.0);
    var total_weight = 0.0;
    let center_color = raw_input[index];

    for (var dy = -kernel_size; dy <= kernel_size; dy = dy + 1) {
        for (var dx = -kernel_size; dx <= kernel_size; dx = dx + 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width ) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let sample_index = u32(x) + u32(y) * u.width;
            let sample_color = raw_input[sample_index];

            // Spatial Gaussian
            let dx_f = f32(dx);
            let dy_f = f32(dy);
            let spatial_weight = exp(-(dx_f * dx_f + dy_f * dy_f) / (2.0 * std_dev * std_dev));

            // Range (color difference) Gaussian
            let color_diff = length(sample_color - center_color);
            let range_weight = exp(-(color_diff * color_diff) / (2.0 * range_std_dev * range_std_dev));

            let weight = spatial_weight * range_weight;

            out += sample_color * weight;
            total_weight += weight;
        }
    }

    out /= total_weight;

    output[index] = out;
}


