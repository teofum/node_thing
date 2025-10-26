fn get_index(x: i32, y: i32, w: i32, h: i32) -> vec3f {
    let clamped_x = clamp(x, 0, w - 1);
    let clamped_y = clamp(y, 0, h - 1);
    let index = u32(clamped_x + clamped_y * w);
    return raw_input[index];
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let x = i32(id.x);
    let y = i32(id.y);
    let w = i32(u.width);
    let h = i32(u.height);

    let center = get_index(x, y, w, h) * 5.0;
    let up     = get_index(x, y - 1, w, h) * -1.0;
    let down   = get_index(x, y + 1, w, h) * -1.0;
    let left   = get_index(x - 1, y, w, h) * -1.0;
    let right  = get_index(x + 1, y, w, h) * -1.0;

    var color = center + up + down + left + right;

    output[index] = color;
}
