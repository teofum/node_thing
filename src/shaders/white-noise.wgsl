fn pcg4d(in: vec4u) -> vec4u {
    var v = in;
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
    v = v ^ (v >> vec4u(16u));
    v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;

    return v;
}

const oneMinusEpsilon = 0x1.fffffep-1;

fn fixedPt2Float(v: u32) -> f32 {
    let f = f32(v) * f32(2.3283064365386963e-10);
    return min(f, oneMinusEpsilon);
}

fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = fixedPt2Float(pcg4d(vec4u(id.x, id.y, 1u, id.x + id.y)).x);
}
