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
    x = (x + f32(id.x) + f32(u.width)) % f32(u.width);
    y = (y + f32(id.y) + f32(u.height)) % f32(u.height);

    output[index] = sample(vec2f(x, y));
}
