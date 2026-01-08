
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const API_KEY = process.env.API_KEY || ''; // Ensure API_KEY is set in your environment

if (!API_KEY && isProduction) {
  console.warn('WARNING: API_KEY is not set. The application might not function correctly without it.');
}

const outDir = 'dist';

// Ensure the output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: path.join(outDir, 'bundle.js'),
  minify: isProduction,
  sourcemap: !isProduction,
  platform: 'browser',
  format: 'esm', // Use ES module format for browser compatibility
  define: {
    'process.env.API_KEY': JSON.stringify(API_KEY),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.js': 'jsx', // Treat .js files as JSX if they contain React components
  },
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  // Externalize react/react-dom if using importmap for these
  // For the current setup, esbuild will bundle them if not externalized.
  // Given the importmap, we can potentially externalize them. Let's keep it simple for now,
  // esbuild will bundle them unless explicitly told not to.
  // The importmap is used by the browser, not esbuild.
  // If we want to *really* use the importmap for React, we'd need to configure esbuild not to bundle React.
  // For simplicity and robustness, esbuild will bundle React from esm.sh if it resolves it.
  // The current importmap allows the browser to fetch react/react-dom if esbuild doesn't bundle them.
  // Let's rely on esbuild bundling them for a single file deployment.
}).then(() => {
  console.log('esbuild finished bundling.');

  // Copy index.html and metadata.json to the dist directory
  fs.copyFileSync('index.html', path.join(outDir, 'index.html'));
  fs.copyFileSync('metadata.json', path.join(outDir, 'metadata.json'));
  console.log('Copied index.html and metadata.json to dist/');
}).catch((error) => {
  console.error('esbuild build failed:', error);
  process.exit(1);
});
