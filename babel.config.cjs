// babel.config.cjs
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        modules: "auto"  // Usar auto para que Babel se encargue del módulo
      },
    ],
  ],
};
