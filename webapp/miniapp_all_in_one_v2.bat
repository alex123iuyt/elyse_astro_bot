@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Telegram Mini App: ALL-IN-ONE v2 (single ngrok agent)

rem =====================[ CONFIG ]=====================
rem --- Frontend (Mini App) ---
set "FRONT_CMD=npm run dev -- -p 3000"
set "FRONT_DIR=."
set "FRONT_PORT=3000"
rem Reserved ngrok domain for the Mini App (stable URL)
set "FRONT_RESERVED_DOMAIN=actual-hopefully-filly.ngrok-free.app"
set "OPEN_BROWSER=1"

rem --- Backend (Bot/API) ---
set "BACK_CMD=py main.py"
set "BACK_DIR=."
set "BACK_PORT=8000"
set "WEBHOOK_PATH=/telegram/webhook"

rem --- Secrets ---
set "BOT_TOKEN=8277242059:AAGBODayjhISs7Toj0swjNRx8j4_rO-fAvk"
set "NGROK_AUTHTOKEN=31C8dSLXQqCcJCKZqd4HNmEpGo6_62cBVzvwP1gHDKWsBEJ56"
rem ====================================================

set "NGROK_CFG=%TEMP%\ngrok-miniapp.yml"

:check_ngrok
where ngrok >nul 2>&1
if errorlevel 1 (
  echo [ERR] ngrok not found in PATH. Install from https://ngrok.com/download and add it to PATH.
  echo Add the folder with ngrok.exe to your PATH and re-run this script.
  pause
  exit /b 1
)

rem Configure ngrok authtoken (idempotent)
ngrok config add-authtoken %NGROK_AUTHTOKEN% >nul 2>&1

:menu
cls
echo ====================================================
echo   Telegram Mini App: ALL-IN-ONE v2
echo ====================================================
echo  [0] Kill existing ngrok processes (fix ERR_NGROK_108)
echo  [1] Start FRONTEND on reserved domain
echo  [2] Start BACKEND and set Telegram webhook
echo  [3] Start BOTH (frontend then backend + one ngrok agent)
echo  [4] Show ngrok tunnel STATUS
echo  [5] REMOVE Telegram webhook
echo  [6] Exit
echo.
set /p "CHOICE=Select 0-6: "

if "%CHOICE%"=="0" goto kill_ngrok
if "%CHOICE%"=="1" goto do_front
if "%CHOICE%"=="2" goto do_back
if "%CHOICE%"=="3" goto do_both
if "%CHOICE%"=="4" goto show_status
if "%CHOICE%"=="5" goto remove_hook
if "%CHOICE%"=="6" goto done
goto menu


:ensure_ngrok_all
rem Write a single ngrok config with TWO tunnels and start one agent if not running
(
  echo authtoken: %NGROK_AUTHTOKEN%
  echo version: 2
  echo tunnels:
  echo   webapp:
  echo     proto: http
  echo     addr: %FRONT_PORT%
  echo     hostname: %FRONT_RESERVED_DOMAIN%
  echo   backend:
  echo     proto: http
  echo     addr: %BACK_PORT%
) > "%NGROK_CFG%"

for /f "tokens=*" %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ (Invoke-RestMethod -UseBasicParsing http://127.0.0.1:4040/api/tunnels) ^| Out-Null; 'RUNNING' } catch { 'STOPPED' }"') do set "NGROK_STATE=%%I"

if /I "%NGROK_STATE%"=="STOPPED" (
  echo [i] Starting SINGLE ngrok agent with both tunnels...
  start "NGROK_ALL" cmd /k ngrok start --all --config "%NGROK_CFG%"
  rem give it a second to boot
  timeout /t 2 >nul
) else (
  echo [i] ngrok agent already running. Reusing it.
)
exit /b 0


:do_front
echo.
echo === Starting FRONTEND ===
if not exist "%FRONT_DIR%" (
  echo [ERR] FRONT_DIR not found: %FRONT_DIR%
  pause
  goto menu
)
pushd "%FRONT_DIR%"
start "WEBAPP" cmd /k %FRONT_CMD%
popd

call :ensure_ngrok_all
call :wait_front_url
if errorlevel 1 (
  echo [ERR] Could not obtain HTTPS URL for %FRONT_RESERVED_DOMAIN%.
  pause
  goto menu
)

echo !FRONT_URL!> ngrok_webapp_url.txt
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard -Value (Get-Content -Raw 'ngrok_webapp_url.txt')"
echo [OK] Frontend public URL: !FRONT_URL!
echo      Saved to ngrok_webapp_url.txt and copied to clipboard.
if "%OPEN_BROWSER%"=="1" start "" "!FRONT_URL!"
echo.
echo [hint] In @BotFather → Main App URL set: !FRONT_URL!
echo.
pause
goto menu


:do_back
echo.
echo === Starting BACKEND ===
if "%BOT_TOKEN%"=="" (
  echo [ERR] BOT_TOKEN is empty. Edit this file and paste your token.
  pause
  goto menu
)
if not exist "%BACK_DIR%" (
  echo [ERR] BACK_DIR not found: %BACK_DIR%
  pause
  goto menu
)

pushd "%BACK_DIR%"
start "BACKEND" cmd /k %BACK_CMD%
popd

call :ensure_ngrok_all
call :wait_back_url
if errorlevel 1 (
  echo [ERR] Could not obtain BACKEND HTTPS URL.
  pause
  goto menu
)

set "WEBHOOK_URL=!BACK_URL!!WEBHOOK_PATH!"
echo !WEBHOOK_URL!> ngrok_backend_webhook_url.txt
echo [i] Setting Telegram webhook to: !WEBHOOK_URL!

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$token=$env:BOT_TOKEN; $url=$env:WEBHOOK_URL; " ^
  "$r=Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot'+$token+'/setWebhook') -Body @{{ url=$url; drop_pending_updates=$true }}; " ^
  "if($r.ok){{ $r | ConvertTo-Json -Depth 4 }} else {{ Write-Error ($r | ConvertTo-Json -Depth 4); exit 2 }}"

if errorlevel 1 (
  echo [ERR] Failed to set webhook. Check backend route and token.
  pause
  goto menu
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard -Value (Get-Content -Raw 'ngrok_backend_webhook_url.txt')"
echo [OK] BACKEND public URL: !BACK_URL!
echo [OK] Webhook set to: !WEBHOOK_URL!
echo      Saved to ngrok_backend_webhook_url.txt and copied to clipboard.
echo.
pause
goto menu


:do_both
call :do_front
call :do_back
goto menu


:show_status
echo.
echo === ngrok STATUS (http://127.0.0.1:4040) ===
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try {{ Invoke-RestMethod -UseBasicParsing http://127.0.0.1:4040/api/tunnels ^| ConvertTo-Json -Depth 6 }} catch {{ 'ngrok API not reachable.' }}"
echo.
pause
goto menu


:remove_hook
echo.
echo === REMOVE Telegram webhook ===
if "%BOT_TOKEN%"=="" (
  echo [ERR] BOT_TOKEN is empty.
  pause
  goto menu
)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$token=$env:BOT_TOKEN; " ^
  "$r=Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot'+$token+'/setWebhook') -Body @{{ url='' }}; " ^
  "if($r.ok){{ 'Webhook removed.' }} else {{ $r | ConvertTo-Json -Depth 4 }}"
echo.
pause
goto menu


:kill_ngrok
echo Killing any running ngrok.exe...
taskkill /IM ngrok.exe /F >nul 2>&1
echo Done.
timeout /t 1 >nul
goto menu


rem ------------------ helpers ------------------

:wait_front_url
rem Wait for ngrok HTTPS URL matching the RESERVED FRONT domain
set "FRONT_URL="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=$env:FRONT_RESERVED_DOMAIN; $u=''; for($i=0;$i -lt 120;$i++){{ " ^
  "  try{{ $r=Invoke-RestMethod -UseBasicParsing http://127.0.0.1:4040/api/tunnels; " ^
  "       $u=($r.tunnels | ?{{ $_.proto -eq 'https' -and $_.public_url -match [regex]::Escape($d) }}).public_url; if($u){{ break }} }}" ^
  "  catch{{}}; Start-Sleep -Milliseconds 500 }}; if(-not $u){{ exit 1 }}; $u"`) do set "FRONT_URL=%%I"
if not defined FRONT_URL exit /b 1
exit /b 0


:wait_back_url
rem Wait for ngrok HTTPS URL that points to BACK_PORT (avoid mixing with frontend tunnel)
set "BACK_URL="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p=$env:BACK_PORT; $u=''; for($i=0;$i -lt 120;$i++){{ " ^
  "  try{{ $r=Invoke-RestMethod -UseBasicParsing http://127.0.0.1:4040/api/tunnels; " ^
  "       $u=($r.tunnels | ?{{ $_.proto -eq 'https' -and ($_.config.addr -match ('localhost:'+[regex]::Escape($p)) -or $_.config.addr -match ('127.0.0.1:'+[regex]::Escape($p))) }}).public_url; if($u){{ break }} }}" ^
  "  catch{{}}; Start-Sleep -Milliseconds 500 }}; if(-not $u){{ exit 1 }}; $u"`) do set "BACK_URL=%%I"
if not defined BACK_URL exit /b 1
exit /b 0


:done
echo Bye.
exit /b 0
