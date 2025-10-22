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
    return vec2u( u32(rand( root + seed )*size)  , u32(rand( root + seed )*size) );
}

fn main( @builtin(global_invocation_id) id: vec3u,) {
    let usize = u32(size);

    // Root will be the identifier of the cell
    let root: vec2f = vec2f( f32((id.x/usize)*usize) , f32((id.y/usize)*usize) );

    // Point wil be the point position inside the cell    
    let point = vec2f(getPoint(root, seed, size));

    let pointPos = root + point;

    var minDistance = 2 * size;
    var num: f32 = 0.0;
    var color: vec3f = vec3f(0.0);

    // gets the min distance
    for(var dx: i32 = -1; dx < 2 ; dx += 1){
        for(var dy: i32 = -1; dy < 2 ; dy += 1){
            let displace = vec2f( f32(dx), f32(dy) );
            let kroot = root + (displace*size);
            let kpoint = vec2f(getPoint(kroot, seed, size));
            let kpointPos = kroot + kpoint;

            let d = distance(vec2f(id.xy), kpointPos);
            
            if( d < minDistance ){
                minDistance = d;
                color = raw_input[u32(kpointPos.x + ( kpointPos.y * f32(u.width) ))];
            }
        }
    }

    output[index] = color;
}
