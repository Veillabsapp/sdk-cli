import { build } from 'bun';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = './dist';

// Ensure dist exists
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR);

console.log('🚀 Starting build...');

async function buildProject() {
  try {
    // 1. Build SDK
    console.log('📦 Bundling SDK...');
    await build({
      entrypoints: ['./src/sdk/index.ts'],
      outdir: DIST_DIR,
      target: 'node',
      minify: true,
      sourcemap: 'external',
    });

    // 2. Build CLI
    console.log('🛠 Bundling CLI...');
    const result = await build({
      entrypoints: ['./index.ts'],
      outdir: DIST_DIR,
      target: 'bun', // CLI is Bun-first
      minify: true,
      naming: 'cli.js',
    });

    if (!result.success) {
      console.error('❌ CLI Build failed');
      console.error(result.logs);
      process.exit(1);
    }

    // 3. Post-process CLI for shebang
    const cliPath = path.join(DIST_DIR, 'cli.js');
    const content = fs.readFileSync(cliPath, 'utf8');
    const shebang = '#!/usr/bin/env bun\n';
    
    // Prepend shebang if not present
    if (!content.startsWith('#!')) {
      fs.writeFileSync(cliPath, shebang + content);
      console.log('✅ Shebang injected into cli.js');
    }

    // Set executable permissions
    fs.chmodSync(cliPath, '755');
    console.log('✅ Executable permissions set');

    console.log('\n✨ Build completed successfully!');
    console.log(`Directory: ${path.resolve(DIST_DIR)}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();
