// Import wgsl shaders as a string
declare module "*.wgsl" {
  const content: string;
  export default content;
}
