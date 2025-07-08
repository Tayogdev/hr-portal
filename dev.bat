@echo off
echo Starting HR Portal with optimized memory settings...
set NODE_OPTIONS=--max-old-space-size=8192 --max-semi-space-size=1024
set NEXT_TELEMETRY_DISABLED=1
set TURBOPACK_MEMORY_LIMIT=8192
npm run dev 