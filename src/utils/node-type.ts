import { NodeType } from "@/schemas/node.schema";

import uvShader from "@/shaders/uv.wgsl";
import timeShader from "@/shaders/time.wgsl";
import grayscaleShader from "@/shaders/grayscale.wgsl";
import thresholdShader from "@/shaders/threshold.wgsl";
import extThresholdShader from "@/shaders/threshold_ext.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import sobelShader from "@/shaders/sobel.wgsl";
import edgeTangentFlowShader from "@/shaders/edge-tangent-flow.wgsl";
import gaussianBlurXShader from "@/shaders/gaussian-blur-x.wgsl";
import gaussianBlurYShader from "@/shaders/gaussian-blur-y.wgsl";
import gaussianBlurEdgeShader from "@/shaders/gaussian-blur-edge.wgsl";
import gaussianBlurEdgeAlongShader from "@/shaders/gaussian-blur-edge-along.wgsl";
import mixShader from "@/shaders/mix.wgsl";
import diffShader from "@/shaders/diff.wgsl";
import extDiffShader from "@/shaders/diff_ext.wgsl";
import exposureShader from "@/shaders/exposure.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";
import mergeChannelsShader from "@/shaders/combine-channels.wgsl";
import chromaticAberrationShader from "@/shaders/chromatic-aberration.wgsl";
import posterizeShader from "@/shaders/posterize.wgsl";
import sharpnessShader from "@/shaders/sharpness.wgsl";
import bloomShader from "@/shaders/bloom.wgsl";
import addShader from "@/shaders/add.wgsl";
import multiplyShader from "@/shaders/multiply.wgsl";
import absShader from "@/shaders/abs.wgsl";
import sineShader from "@/shaders/sine.wgsl";
import fractShader from "@/shaders/fract.wgsl";
import constantShader from "@/shaders/constant.wgsl";
import whiteNoiseShader from "@/shaders/white-noise.wgsl";
import checkersPatternShader from "@/shaders/checker-pattern.wgsl";
import bayerPatternShader from "@/shaders/bayer-pattern-8x8.wgsl";
import pixelateShader from "@/shaders/pixelate.wgsl";
import tonemapReinhardShader from "@/shaders/tone_map-reinhard.wgsl";
import tonemapACESShader from "@/shaders/tone-map-aces.wgsl";
import tonemapHableShader from "@/shaders/tone-map-hable.wgsl";
import heatmapShader from "@/shaders/heatmap.wgsl";
import multiStepMixShader from "@/shaders/multiStepMix.wgsl";

export const NODE_TYPES = {
  // Input & output ///////////////////////////////
  __input_image: {
    name: "Image",
    category: "Input",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {
      image: {
        name: "Image",
        type: "image",
      },
    },
  },
  __input_layer: {
    name: "Underlying layer",
    category: "Input",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {},
  },
  uv: {
    name: "UV",
    category: "Input",
    shader: uvShader,
    inputs: {},
    outputs: {
      out_u: {
        name: "U",
        type: "number",
      },
      out_v: {
        name: "V",
        type: "number",
      },
    },
    parameters: {},
  },
  time: {
    name: "Time",
    category: "Input",
    shader: timeShader,
    inputs: {},
    outputs: {
      output: {
        name: "t",
        type: "number",
      },
    },
    parameters: {},
  },
  __output: {
    name: "Output",
    category: "Special",
    shader: "",
    inputs: {
      color: {
        name: "Layer output",
        type: "color",
      },
      alpha: {
        name: "Layer alpha",
        type: "number",
      },
    },
    outputs: {},
    parameters: {},
  },
  // Generate category ///////////////////////////////
  white_noise: {
    name: "White Noise",
    category: "Generate",
    shader: whiteNoiseShader,
    inputs: {},
    outputs: {
      output: {
        name: "Noise",
        type: "number",
      },
    },
    parameters: {},
  },
  checkers_Pattern: {
    name: "Checkers Pattern",
    category: "Generate",
    shader: checkersPatternShader,
    inputs: {},
    outputs: {
      output: {
        name: "Pattern",
        type: "number",
      },
    },
    parameters: {},
  },
  bayers_Pattern_8x8: {
    name: "Bayers Pattern 8x8",
    category: "Generate",
    shader: bayerPatternShader,
    inputs: {},
    outputs: {
      output: {
        name: "Pattern",
        type: "number",
      },
    },
    parameters: {},
  },
  // Math category ///////////////////////////////
  constant: {
    name: "Constant",
    category: "Math",
    shader: constantShader,
    inputs: {
      value: {
        name: "Value",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "k",
        type: "number",
      },
    },
    parameters: {},
  },
  add: {
    name: "Add",
    category: "Math",
    shader: addShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
      y: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "x + y",
        type: "number",
      },
    },
    parameters: {},
  },
  multiply: {
    name: "Multiply",
    category: "Math",
    shader: multiplyShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
      y: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "x × y",
        type: "number",
      },
    },
    parameters: {},
  },
  abs: {
    name: "Absolute value",
    category: "Math",
    shader: absShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "|x|",
        type: "number",
      },
    },
    parameters: {},
  },
  sine: {
    name: "Sine wave",
    category: "Math",
    shader: sineShader,
    inputs: {
      t: {
        name: "t",
        type: "number",
      },
      phase: {
        name: "Phase",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Sine",
        type: "number",
      },
    },
    parameters: {},
  },
  fract: {
    name: "Split decimal",
    category: "Math",
    shader: fractShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
    },
    outputs: {
      integer_part: {
        name: "⌊x⌋",
        type: "number",
      },
      decimal_part: {
        name: "x - ⌊x⌋",
        type: "number",
      },
    },
    parameters: {},
  },
  // Filters category ///////////////////////////////
  boxBlur: {
    name: "Box Blur",
    category: "Filter",
    shader: boxBlurShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      kernel_size: {
        name: "Radius",
        type: "number",
        max: 25,
        step: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  gaussBlur: {
    name: "Gaussian blur",
    category: "Filter",
    shader: gaussianBlurXShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
    additionalPasses: [
      {
        shader: gaussianBlurYShader,
        buffers: [
          { name: "inout_image", type: "color" },
          { name: "inout_std_dev", type: "number" },
        ],
      },
    ],
  },
  gaussBlurEdge: {
    name: "Gaussian blur across edges",
    category: "Filter",
    shader: gaussianBlurEdgeShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
      },
      tangent: {
        name: "Tangent",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  gaussBlurEdgeAlong: {
    name: "Gaussian blur along edges",
    category: "Filter",
    shader: gaussianBlurEdgeAlongShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
      },
      tangent: {
        name: "Tangent",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  sharpness: {
    name: "Sharpness",
    category: "Filter",
    shader: sharpnessShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  sobel: {
    name: "Sobel",
    category: "Filter",
    shader: sobelShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Gradient",
        type: "color",
      },
    },
    parameters: {},
  },
  // Blend category ///////////////////////////////
  mix: {
    name: "Mix",
    category: "Blend",
    shader: mixShader,
    inputs: {
      input_a: {
        name: "A",
        type: "color",
      },
      input_b: {
        name: "B",
        type: "color",
      },
      factor: {
        name: "Factor",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  diff: {
    name: "Difference",
    category: "Blend",
    shader: diffShader,
    inputs: {
      input_a: {
        name: "A",
        type: "color",
      },
      input_b: {
        name: "B",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  diffExt: {
    name: "Extended Difference",
    category: "Blend",
    shader: extDiffShader,
    inputs: {
      input_a: {
        name: "A",
        type: "color",
      },
      input_b: {
        name: "B",
        type: "color",
      },
      tau: {
        name: "Tau",
        type: "number",
        min: 1,
        max: 10,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Color category ///////////////////////////////
  grayscale: {
    name: "Grayscale",
    category: "Color",
    shader: grayscaleShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  threshold: {
    name: "Threshold",
    category: "Color",
    shader: thresholdShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  threshold_ext: {
    name: "Extended Threshold",
    category: "Color",
    shader: extThresholdShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
      phi: {
        name: "Falloff",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  exposure: {
    name: "Exposure",
    category: "Color",
    shader: exposureShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      ev: {
        name: "EV",
        type: "number",
        min: -5,
        max: 5,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  tonemapReinhard: {
    name: "Tonemap Reinhard",
    category: "Color",
    shader: tonemapReinhardShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      white: {
        name: "White point",
        type: "number",
        min: 0.0,
        max: 10.0,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  tonemapACES: {
    name: "Tonemap ACES",
    category: "Color",
    shader: tonemapACESShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  tonemapHable: {
    name: "Tonemap hable",
    category: "Color",
    shader: tonemapHableShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Effects category ///////////////////////////////
  chromaticAberration: {
    name: "Chromatic Aberration",
    category: "Effects",
    shader: chromaticAberrationShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      angle_r: { name: "Angle R", type: "number" },
      angle_g: { name: "Angle G", type: "number" },
      angle_b: { name: "Angle B", type: "number" },
      magni_r: { name: "Magnitude R", type: "number" },
      magni_g: { name: "Magnitude G", type: "number" },
      magni_b: { name: "Magnitude B", type: "number" },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  posterize: {
    name: "Posterize",
    category: "Effects",
    shader: posterizeShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      steps: {
        name: "Steps",
        type: "number",
        min: 2,
        max: 16,
        step: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  bloom: {
    name: "Bloom",
    category: "Effects",
    shader: bloomShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  pixelate: {
    name: "pixelate",
    category: "Effects",
    shader: pixelateShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      kernel_size: {
        name: "Radius",
        type: "number",
        max: 25,
        step: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  heatmap: {
    name: "Heatmap",
    category: "Effects",
    shader: heatmapShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  multiStepMix: {
    name: "Multi step Mix",
    category: "Effects",
    shader: multiStepMixShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      color1: {
        name: "color1",
        type: "color",
      },
      color2: {
        name: "color2",
        type: "color",
      },
      color3: {
        name: "color3",
        type: "color",
      },
      color4: {
        name: "color4",
        type: "color",
      },
      color5: {
        name: "color5",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Utility category ///////////////////////////////
  split_channels: {
    name: "Split channels",
    category: "Utility",
    shader: splitChannelsShader,
    inputs: {
      input: {
        name: "Color",
        type: "color",
      },
    },
    outputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    parameters: {},
  },
  merge_channels: {
    name: "Merge channels",
    category: "Utility",
    shader: mergeChannelsShader,
    inputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Color",
        type: "color",
      },
    },
    parameters: {},
  },
  edge_tangent_flow: {
    name: "Edge Tangent Flow",
    category: "Utility",
    shader: edgeTangentFlowShader,
    inputs: {
      gradient: {
        name: "Gradient",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
