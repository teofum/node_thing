const ONE_MINUS_EPSILON: f32 = 0x1.fffffep-1;

fn rand(seed: vec2f) -> f32 {
    let s = vec2u(abs(seed * 65535.0));
    var v = vec4u(s.x, s.y, 1u, s.x ^ (s.y << 16u));

    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.w;  v.y += v.z * v.x;  v.z += v.x * v.y;  v.w += v.y * v.z;
    v = v ^ (v >> vec4u(16u));
    v.x += v.y * v.w;  v.y += v.z * v.x;  v.z += v.x * v.y;  v.w += v.y * v.z;

    let f = f32(v.x) * 2.3283064365386963e-10;
    return min(f, ONE_MINUS_EPSILON);
}


fn main( @builtin(global_invocation_id) id: vec3u,) {
    let usize = u32(size);

    let root: vec2f = vec2f( f32((id.x/usize)*usize) , f32((id.y/usize)*usize) );
    let kernel00 = root;
    let kernel10 = root + vec2f(size ,  0.0);
    let kernel01 = root + vec2f(  0.0, size);
    let kernel11 = root + vec2f(size , size);
    
    let a00: f32 = rand(kernel00 + seed) + t;
    let a10: f32 = rand(kernel10 + seed) + t;
    let a01: f32 = rand(kernel01 + seed) + t;
    let a11: f32 = rand(kernel11 + seed) + t;

    let kernelPos = vec2f(id.xy) - root;

    // Local coords in cell [0, size) -> [0,1)
    let uv   = kernelPos / size;
    let u    = uv.x * uv.x * uv.x * (uv.x * (uv.x * 6.0 - 15.0) + 10.0);
    let v    = uv.y * uv.y * uv.y * (uv.y * (uv.y * 6.0 - 15.0) + 10.0);

    // Turn corner scalars into gradient directions via angle = pi2 * a
    let pi2  = 6.28318530718;
    let avec00  = vec2f(cos(a00 * pi2), sin(a00 * pi2));
    let avec10  = vec2f(cos(a10 * pi2), sin(a10 * pi2));
    let avec01  = vec2f(cos(a01 * pi2), sin(a01 * pi2));
    let avec11  = vec2f(cos(a11 * pi2), sin(a11 * pi2));

    // Offset vectors from each corner to sample point
    let offset00  = kernelPos - vec2f(0.0,   0.0);
    let offset10  = kernelPos - vec2f(size,  0.0);
    let offset01  = kernelPos - vec2f(0.0,   size);
    let offset11  = kernelPos - vec2f(size,  size);

    // Corner contributions (dot of avec and setient with offset)
    let n00  = dot(avec00, offset00 / size);
    let n10  = dot(avec10, offset10 / size);
    let n01  = dot(avec01, offset01 / size);
    let n11  = dot(avec11, offset11 / size);

    // Bilinear interpolation with Perlin fade
    let lerp0  = mix(n00, n10, u);
    let lerp1  = mix(n01, n11, u);
    let n    = mix(lerp0, lerp1, v);

    // Remap roughly from [-1,1] -> [0,1] and clamp
    let val  = clamp(n * 0.5 + 0.5, 0.0, 1.0);

    output[index] = val;
}
