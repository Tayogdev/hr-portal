const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Optimizing development environment...');

// Function to safely remove directory
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      // Use rimraf approach for Windows compatibility
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
      } else {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
      console.log(`🗑️  Cleared: ${path.basename(dirPath)}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${path.basename(dirPath)}: ${error.message}`);
    }
  }
}

// Function to safely remove file
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Cleared: ${path.basename(filePath)}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${path.basename(filePath)}: ${error.message}`);
    }
  }
}

// Clear Next.js cache
const nextCachePath = path.join(process.cwd(), '.next');
removeDirectory(nextCachePath);

// Clear TypeScript cache
const tsCachePath = path.join(process.cwd(), 'tsconfig.tsbuildinfo');
removeFile(tsCachePath);

// Clear node_modules/.cache if it exists
const nodeCachePath = path.join(process.cwd(), 'node_modules', '.cache');
removeDirectory(nodeCachePath);

console.log('✅ Development environment optimized!');
console.log('💡 Run "npm run dev" to start the development server');
