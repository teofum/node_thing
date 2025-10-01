fn main(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let R = i32(floor(kernel_size));

    var sum = vec3f(0.0);
    for (var dy = -R; dy <= R; dy = dy + 1) {
        for (var dx = -R; dx <= R; dx = dx + 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);

            let sample_index = u32(x) + u32(y) * u.width;
            sum = sum + raw_input[sample_index];
        }
    }

    let avg = sum / f32((2 * R + 1) * (2 * R + 1));

    output[index] = avg;
}
