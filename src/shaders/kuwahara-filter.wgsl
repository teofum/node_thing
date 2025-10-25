const NUM_SECTORS: i32 = 8;
const PI: f32 = 3.14159265359;

fn kuwaharaFilter( coord: vec2i, radius: i32, imageSize: vec2i ) -> vec3f {
    var sum: array<vec3f, NUM_SECTORS>;
    var sumSq: array<vec3f, NUM_SECTORS>;
    var count: array<i32, NUM_SECTORS>;

    // Initialize accumulators
    for (var i = 0; i < NUM_SECTORS; i++) {
        sum[i] = vec3f(0.0);
        sumSq[i] = vec3f(0.0);
        count[i] = 0;
    }

    // Iterate over circular neighborhood
    for (var dy = -radius; dy <= radius; dy++) {
        for (var dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy > radius * radius) {
                continue;
            }

            let kernelCoord = coord + vec2i(dx, dy);
            if (any(kernelCoord < vec2i(0)) || any(kernelCoord >= imageSize)) {
                continue;
            }

            let color = raw_input[kernelCoord.x + kernelCoord.y * i32(u.width)];
            let angle = atan2(f32(dy), f32(dx));
            var sector = i32(floor((angle + PI) / (2.0 * PI / f32(NUM_SECTORS)))) % NUM_SECTORS;

            sum[sector] += color;
            sumSq[sector] += color * color;
            count[sector] += 1;
        }
    }

    // Find sector with lowest variance
    var bestVariance = 1e9;
    var bestColor = vec3f(0.0);
    for (var i = 0; i < NUM_SECTORS; i++) {
        if (count[i] == 0) { continue; }
        let mean = sum[i] / f32(count[i]);
        let meanSq = sumSq[i] / f32(count[i]);
        let variance = dot(meanSq - mean * mean, vec3f(0.3333)); // average across RGB
        if (variance < bestVariance) {
            bestVariance = variance;
            bestColor = mean;
        }
    }

    return bestColor;
}

fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    output[index] = kuwaharaFilter(vec2i(i32(id.x),i32(id.y)), i32(R), vec2i(i32(u.width),i32(u.height)));
}
