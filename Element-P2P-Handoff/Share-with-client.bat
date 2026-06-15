@echo off
setlocal
cd /d "%~dp0"

echo.
echo  --- Element P2P: preparing files to share ---
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install the LTS version from https://nodejs.org
  echo  Then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  First-time setup: installing dependencies ^(may take a minute^)...
  call npm install
  if errorlevel 1 (
    echo  npm install failed.
    pause
    exit /b 1
  )
)

echo  Building...
call npm run build
if errorlevel 1 (
  echo  Build failed.
  pause
  exit /b 1
)

echo.
echo  NEXT STEPS:
echo   1. A browser tab will open Netlify Drop.
echo   2. File Explorer will open your "dist" folder.
echo   3. Drag the DIST folder onto the Netlify page.
echo   4. Open the link Netlify gives you, then add:  /presentation
echo      Example: https://yoursite.netlify.app/presentation
echo.
echo  Full instructions: SHARE-WITH-CLIENT.txt
echo.

start "" "https://app.netlify.com/drop"
explorer "%~dp0dist"

pause
