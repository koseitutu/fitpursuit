module.exports = function (api) {
  const platform = api.caller((c) => c?.platform);
  const isDev = api.caller((c) => c?.isDev);
  const sourceMeta = process.env.EXPO_SOURCE_METADATA;
  api.cache.using(() => `${platform}:${isDev}:${sourceMeta}`);

  // Clean, minimal plugins list keeping your layout completely stable
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
          // This safely instructs the core Expo preset to compile all modern 
          // TypeScript/JavaScript class properties and methods down for Hermes
          setPublicClassFields: true,
        },
      ],
    ],
    plugins,
    overrides: [
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