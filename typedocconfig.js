module.exports = {
  src: [
    './src/DockLayout.tsx',
    './src/DockData.ts',
  ],
  mode: 'file',
  tsconfig: 'tsconfig.json',
  out: './www',
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  readme: 'README.md',
  name: 'RC Dock',
  ignoreCompilerErrors: true,
  plugin: 'none'
};