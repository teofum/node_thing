fn main(
    @builtin(global_invocation_id) id: vec3u
) {
    let offset = vec2i(vec2u(u.x, u.y));
    color = pow(color, vec3f(1.0 / 2.2));

    if u.has_alpha != 0u {
        textureStore(tex, vec2i(id.xy) + offset, vec4f(color * alpha, alpha));
    } else {
        textureStore(tex, vec2i(id.xy) + offset, vec4f(color, 1.0));
    }
}
