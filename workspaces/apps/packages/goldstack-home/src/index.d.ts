declare module '*.svg' {
  const content: any; // biome-ignore lint/suspicious/noExplicitAny: SVG module type
  export default content;
}

declare module '*.png' {
  const content: any; // biome-ignore lint/suspicious/noExplicitAny: PNG module type
  export default content;
}

declare module '*.jpg' {
  const content: any; // biome-ignore lint/suspicious/noExplicitAny: JPG module type
  export default content;
}

declare module '*.jpeg' {
  const content: any; // biome-ignore lint/suspicious/noExplicitAny: JPEG module type
  export default content;
}

declare module '*.gif' {
  const content: any; // biome-ignore lint/suspicious/noExplicitAny: GIF module type
  export default content;
}
