interface Query {}

const tag = (_: TemplateStringsArray, ...__: any[]): Query => ({});

export const query = () => tag``;
