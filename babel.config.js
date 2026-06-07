module.exports = function (api) {
  const platform = api.caller((c) => c?.platform);
  const isDev = api.caller((c) => c?.isDev);
  const sourceMeta = process.env.EXPO_SOURCE_METADATA;
  api.cache.using(() => `${platform}:${isDev}:${sourceMeta}`);

  const plugins = [];

  // Source metadata for AI agent inspection (web preview + local dev only)
  if (platform === 'web' && (isDev || process.env.EXPO_SOURCE_METADATA === '1')) {
    plugins.push('./babel-plugin-source-metadata');
  }

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
          setPublicClassFields: true,
        },
      ],
    ],
    plugins,
    overrides: [
      {
        // FORCE compilation on all third-party code to catch rogue syntax
        test: /[\\/]node_modules[\\/]/,
        presets: ['babel-preset-expo'],
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