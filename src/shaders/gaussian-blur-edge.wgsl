const PI = 3.1415926538;

fn sample(coord: vec2f) -> vec3f {
  let int_coord = vec2u(coord);
  let frac_coord = fract(coord);

  let i00 = raw_input[int_coord.x + int_coord.y * u.width];
  let i01 = raw_input[int_coord.x + (int_coord.y + 1) * u.width];
  let i10 = raw_input[int_coord.x + 1 + int_coord.y * u.width];
  let i11 = raw_input[int_coord.x + 1 + (int_coord.y + 1) * u.width];

  return mix(
    mix(i00, i01, vec3f(frac_coord.y)),
    mix(i10, i11, vec3f(frac_coord.y)),
    vec3f(frac_coord.x),
  );
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let kernel_size = max(std_dev * 2.0, 1.0);
    let step_size = clamp(std_dev * 0.2, 0.02, 1.0);

    var out = vec3f(0.0);
    var intensity = 0.0;
    for (var du = -kernel_size; du <= kernel_size; du += step_size) {
        let dx = du * tangent.y;
        let dy = du * tangent.x;
        let x = clamp(f32(id.x) + dx, 0.0, f32(u.width) - 1.0);
        let y = clamp(f32(id.y) + dy, 0.0, f32(u.height) - 1.0);

        let gaussian_v = 1.0 / (2.0 * PI * std_dev * std_dev) * exp(-(du * du) / (2.0 * std_dev * std_dev));
        let c = sample(vec2f(x, y));
        out += c * gaussian_v;
        intensity += gaussian_v;
    }

    out /= intensity;
    output[index] = out;
}
