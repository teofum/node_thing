
@group(0) @binding(0)
var<storage, read_write> input: array<vec4f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec4f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

const R : i32 = 1; //el radio del blur

@compute @workinggroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id : vec3<u32>) {

    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var sum : vec4<f32> = vec4<f32>(0.0);

    for(var dy : i32 = -R; dy <= R; dy = dy + 1 ){
        for(var dx : i32 = -R; dx <= R; dx =dx + 1){
            let x = clamp(i32=(id.x)+dx, 0, i32(dims.x) -1);
            let y = clamp(i32=(id.y)+dy, 0, i32(dims.y) -1);

            let c = input[index];
            sum = sum + c;
        }
    }

    let kernelSize = f32((2*R+1)*(2*R+1));
    let avg = sum / kernelSize;

    output[index] = avg;
}
