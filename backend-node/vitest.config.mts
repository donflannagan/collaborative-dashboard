import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,mts}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Configure Test UI dashboards
    reporters: ['default', 'html'],
    outputFile: {
      html: './html-report/index.html',
    },

    // 🚀 Add Code Coverage Configurations
    coverage: {
      provider: 'v8', // Uses Node's native engine execution tracker
      reporter: ['text', 'html'], // Outputs terminal numbers AND high-fidelity web charts
      reportsDirectory: './html-report/coverage', // Merges maps directly into your dashboard path
      include: ['src/**/*.ts'], // Only trace core application files
      exclude: [
        'src/__tests__/**',
        'src/interfaces/**',
        'src/models/**',       // Mongoose schemas don't contain unit-testable code
        'src/config/**',       // Env variables and db connection configurations
        'src/middleware/**',   // Global express routers/error handlers
        'src/socket/**',       // Socket.io initialization scripts
        'src/app.ts',          // Express application bootstrap
        'src/server.ts',       // Server network listener hook
        'src/routes/index.ts'  // Root routing hub file
      ],
      
      // Optional: Strict quality gate thresholds to secure your builds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      }
    },
  },
});