@echo off
title Novel Writing Application
cd /d "%~dp0"
echo Dang khoi dong Novel Writing Application...
start http://127.0.0.1:1420/
start http://127.0.0.1:1421/
npm run dev
pause
