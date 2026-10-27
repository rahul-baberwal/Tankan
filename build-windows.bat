@echo off
rem Builds the Windows installers on your own PC.
rem Needs: Node.js 20+  (https://nodejs.org)  and  Rust (https://rustup.rs), plus "Desktop development with C++" from Visual Studio Build Tools.
where node >nul 2>nul || (echo Node.js is not installed. & exit /b 1)
where cargo >nul 2>nul || (echo Rust is not installed. & exit /b 1)
call npm install || exit /b 1
call npm run build:windows || exit /b 1
echo.
echo Done. Installers are in:
echo   src-tauri\target\release\bundle\msi
echo   src-tauri\target\release\bundle\nsis
start "" src-tauri\target\release\bundle
