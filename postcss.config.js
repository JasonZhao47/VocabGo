export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // PurgeCSS is handled by Tailwind's built-in purge
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
        }],
      },
    } : {}),
  },
}

