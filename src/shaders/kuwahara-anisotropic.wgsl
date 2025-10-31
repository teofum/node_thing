const NUM_SECTORS: i32 = 8;
const PI: f32 = 3.14159265359;

fn kuwaharaFilter( coord: vec2i, radius: i32, imageSize: vec2i ) -> vec3f {
    var sum: array<vec3f, NUM_SECTORS>;
    var sumSq: array<vec3f, NUM_SECTORS>;
    var count: array<f32, NUM_SECTORS>;

    let width = u.width;

    let gx = raw_input[(coord.x + 1) + coord.y * i32(width)] - raw_input[(coord.x - 1) + coord.y * i32(width)];
    let gy = raw_input[coord.x + (coord.y + 1) * i32(width)] - raw_input[coord.x + (coord.y - 1) * i32(width)];

    let grad = vec2f(dot(gx, vec3f(0.3333)), dot(gy, vec3f(0.3333)));
    let orientation = atan2(grad.y, grad.x);

    let anisotropy = 2.0; 
    let c = cos(orientation);
    let s = sin(orientation);

    // Rotation * scaling matrix
    let M = mat2x2f(
        c / anisotropy, -s * anisotropy,
        s / anisotropy,  c * anisotropy
    );

    // Initialize accumulators
    for (var i = 0; i < NUM_SECTORS; i++) {
        sum[i] = vec3f(0.0);
        sumSq[i] = vec3f(0.0);
        count[i] = 0;
    }

    // Iterate over circular neighborhood
    for (var dy = -radius; dy <= radius; dy++) {
        for (var dx = -radius; dx <= radius; dx++) {
            let local = M * vec2f(f32(dx), f32(dy));
            if (dot(local, local) > f32(radius * radius)){ continue; }

            let kernelCoord = coord + vec2i(dx, dy);
            if (any(kernelCoord < vec2i(0)) || any(kernelCoord >= imageSize)) { continue; }

            let color = raw_input[kernelCoord.x + kernelCoord.y * i32(width)];
            let angle = atan2(f32(dy), f32(dx));
            var sector = i32(floor((angle + PI) / (2.0 * PI / f32(NUM_SECTORS)))) % NUM_SECTORS;

            let radius_p = f32(dx*dx + dy*dy) / f32(radius*radius);

            // gaussian weights based on radious
            let sigma = 0.2;  // controls sharpness
            let weight = exp(- ((radius_p-0.25)*(radius_p-0.25)) / (2.0 * sigma * sigma));

            sum[sector] += weight * color;
            sumSq[sector] += weight * color * color;
            count[sector] += weight * 1;
        }
    }


    var color_sum = vec3f(0.0);
    var weight_sum = f32(0);

    for (var i = 0; i < NUM_SECTORS; i++) {
        if (count[i] == 0) { continue; }
        let mean_color = sum[i] / f32(count[i]);
        let meanSq = sumSq[i] / f32(count[i]);
        let sector_variance = dot(meanSq - mean_color * mean_color, vec3f(0.3333)); // average across RGB

        //magic numbers :P maybe make input, el 200 seria mas interesante de input
        let sector_weight = pow(1.0 / (1.0 + 200 * sector_variance), 8);
        color_sum += mean_color * sector_weight;
        weight_sum += sector_weight;

    }

    return color_sum / weight_sum;

}

fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    output[index] = kuwaharaFilter(vec2i(i32(id.x),i32(id.y)), i32(R), vec2i(i32(u.width),i32(u.height)));
}
