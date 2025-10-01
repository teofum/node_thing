
fn main(@builtin(global_invocation_id) id: vec3u) {
    let SIZE = u32(floor(kernel_size));

    let x = id.x - (id.x %SIZE);
    let y = id.y - (id.y %SIZE);

    output[index] = raw_input[ x + (y * u.width)];
}
