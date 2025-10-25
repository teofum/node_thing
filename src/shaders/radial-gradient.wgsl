fn main(
    @builtin(global_invocation_id) id: vec3u
) {
    let pos = vec2f(f32(id.x), f32(id.y));
    var delta = pos - lu.position;
    delta = vec2f(
      delta.x * cos(-lu.angle) - delta.y * sin(-lu.angle),
      delta.x * sin(-lu.angle) + delta.y * cos(-lu.angle),
    );

    let r = length(delta / lu.size);
    output[index] = 1.0 - smoothstep(lu.innerRadius, 1.0, r);
}
