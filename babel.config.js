module.exports = function (api) {
  const platform = api.caller((c) => c?.platform);
  const isDev = api.caller((c) => c?.isDev);
  const sourceMeta = process.env.EXPO_SOURCE_METADATA;
  api.cache.using(() => `${platform}:${isDev}:${sourceMeta}`);

  const plugins = [];

  if (platform === 'web' && (isDev || process.env.EXPO_SOURCE_METADATA === '1')) {
    plugins.push('./babel-plugin-source-metadata');
  }

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins,
    overrides: [
      {
        // Target ALL files including node_modules to guarantee private fields are stripped
        test: /[\s\S]*/,
        plugins: [
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }]
        ]
      },
      {
        // Include @fastshot/* packages for env var inlining
        include: /node_modules\/@fastshot\/(ai|auth)/,
        plugins: [
          [
            'transform-inline-environment-variables',
            {
              include: [
                'EXPO_PUBLIC_PROJECT_ID',
                'EXPO_PUBLIC_NEWELL_API_URL',
                'EXPO_PUBLIC_AUTH_BROKER_URL',
                'EXPO_PUBLIC_AUTH_CLIENT_ID',
              ],
            },
          ],
        ],
      },
    ],
  };
};