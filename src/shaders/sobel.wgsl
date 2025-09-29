fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let luma = vec3f(0.2126, 0.7152, 0.0722);

    var result: vec3f = vec3f(0.0);
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let idx = u32(x) + u32(y) * u.width;

            let weight_x = f32(-dx) * f32(2 - abs(dy));
            let weight_y = f32(-dy) * f32(2 - abs(dx));

            result += vec3f(
              dot(luma, raw_input[idx]) * weight_x,
              dot(luma, raw_input[idx]) * weight_y,
              0.0,
            );
        }
    }

    output[index] = result;
}
