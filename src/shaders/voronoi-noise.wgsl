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


fn getPoint(root: vec2f, seed: f32, size: f32) -> vec2u {
    return vec2u( u32(rand( root + seed )*size),u32(rand( root + seed )*size));
}

fn main( @builtin(global_invocation_id) id: vec3u,) {
    let usize = u32(size);

    // Root will be the identifier of the cell
    let root: vec2f = vec2f( f32((id.x/usize)*usize) , f32((id.y/usize)*usize) );

    // Point wil be the point position inside the cell    
    let point = vec2f(getPoint(root, seed, size));

    let pointPos = root + point;

    // de aca pa arriba anda /////////////

    var minDistance = 2 * size;
    var num: f32 = 0.0;

    var orderx: array<i32, 8> = array<i32, 8>(-1i,  0i,  1i, -1i, 1i, -1i, 0i, 1i);
    var ordery: array<i32, 8> = array<i32, 8>(-1i, -1i, -1i,  0i, 0i,  1i, 1i, 1i);
    for (var i: u32 = 0; i < 8; i += 1) {
        let displace = vec2f( f32(orderx[i]), f32(ordery[i]));

        let kroot = root + displace;
        let kpoint = vec2f(getPoint(kroot, seed, size));
        let kpointPos = kroot + kpoint;

        let d = distance(pointPos,kpoint);

        if( d < minDistance ){
            minDistance = d;
            num = smoothstep(0.0, d, distance( pointPos, vec2f(id.xy) ));
        }

    }

    output[index] = num;
}
