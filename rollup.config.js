import pluginTypescript from '@rollup/plugin-typescript';

const common = {
  input: 'src/index.ts',
  plugins: [
    pluginTypescript(),
  ],
  external: ['dayjs', 'ulid', 'validator'],
};

export default [
  {
    ...common,
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
  },
  {
    ...common,
    output: {
      file: 'dist/index.mjs',
      format: 'es',
    },
  },
];
