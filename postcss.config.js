export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS optimization for production builds
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Remove all comments
          discardComments: {
            removeAll: true,
          },
          // Normalize whitespace
          normalizeWhitespace: true,
          // Merge duplicate rules
          mergeLonghand: true,
          mergeRules: true,
          // Minify selectors
          minifySelectors: true,
          // Minify font values
          minifyFontValues: true,
          // Normalize URLs
          normalizeUrl: true,
          // Remove duplicate declarations
          uniqueSelectors: true,
          // Optimize calc() expressions
          calc: true,
          // Convert colors to shortest form
          colormin: true,
          // Discard empty rules
          discardEmpty: true,
          // Discard duplicate rules
          discardDuplicates: true,
          // Discard overridden declarations
          discardOverridden: true,
          // Minify gradients
          minifyGradients: true,
          // Reduce initial values
          reduceInitial: true,
          // Reduce transforms
          reduceTransforms: true,
          // Sort media queries
          sortMediaQueries: true,
        }],
      },
    } : {}),
  },
}

