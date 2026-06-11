export const TECH_STACK_OPTIONS = [
  'React',
  'Vue.js',
  'Node.js',
  'Python',
  'Django',
  'Flutter',
  'Swift',
  'AWS',
  'Docker',
  'TensorFlow',
  'MongoDB',
  'PostgreSQL',
  'Figma',
  'Go',
  'Rust',
] as const;

export type TechStackOption = (typeof TECH_STACK_OPTIONS)[number];
