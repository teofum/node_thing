/*
@group(0) @binding(0)
var srcTex : texture_2d<f32>;

@group(0) @binding(1)
var dstTex : texture_storage_2d<rgba8unorm, write>;

const R : i32 = 1; //el radio del blur

@compute @workinggroup_size(16, 16) //esto H no estoy muy seguro
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
    let dims = textureDimensions( srcTex );

    if( gid.x >= dims.x || gid.y >= dims.y ){
        return;
    }

    var sum : vec4<f32> = vec4<f32>(0.0);

    for(var dy : i32 = -R; dy <= R; dy = dy + 1 ){
        for(var dx : i32 = -R; dx <= R; dx =dx + 1){
            let x = clamp(i32=(gid.x)+dx, 0, i32(dims.x) -1);
            let y = clamp(i32=(gid.y)+dy, 0, i32(dims.y) -1);

            let c = textrueLoad(srcTex, vec2<i32>(x, y), 0);
            sum = sum + c;
        }
    }

    let kernelSize = f32((2*R+1)*(2*R+1));
    let avg = sum / kernelSize;

    textureStore(dstTex, vec2<i32>(i32(gid.x), i32(gid.y)), avg);
}
*/