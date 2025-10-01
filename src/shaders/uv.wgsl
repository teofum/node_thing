fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    out_u[index] = f32(id.x) / f32(u.width);
    out_v[index] = f32(id.y) / f32(u.height);
}
