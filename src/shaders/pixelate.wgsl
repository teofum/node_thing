
fn main(@builtin(global_invocation_id) id: vec3u) {
    let size = u32(floor(kernel_size));

    let x: u32 = (id.x/size)*size;
    let y: u32 = (id.y/size)*size;

    output[index] = raw_input[ x + (y * u.width)];
}
