const PI2: f32 = 6.283185307179586; // 2π

fn main(@builtin(global_invocation_id) id: vec3u) {
    angle_r *= PI2;
    angle_g *= PI2;
    angle_b *= PI2;

    var x_r: u32 = u32(clamp(floor(f32(id.x) + sin(angle_r) * magni_r), 0.0, f32(u.width - 1u)));
    var y_r: u32 = u32(clamp(floor(f32(id.y) + cos(angle_r) * magni_r), 0.0, f32(u.height - 1u)));
    let index_r: u32 = x_r + (y_r * u.width);

    var x_g: u32 = u32(clamp(floor(f32(id.x) + sin(angle_g) * magni_g), 0.0, f32(u.width - 1u)));
    var y_g: u32 = u32(clamp(floor(f32(id.y) + cos(angle_g) * magni_g), 0.0, f32(u.height - 1u)));
    let index_g: u32 = x_g + (y_g * u.width);

    var x_b: u32 = u32(clamp(floor(f32(id.x) + sin(angle_b) * magni_b), 0.0, f32(u.width - 1u)));
    var y_b: u32 = u32(clamp(floor(f32(id.y) + cos(angle_b) * magni_b), 0.0, f32(u.height - 1u)));
    let index_b: u32 = x_b + (y_b * u.width);

    output[index] = vec3f(
        raw_input[index_r].r,
        raw_input[index_g].g,
        raw_input[index_b].b
    );
}
