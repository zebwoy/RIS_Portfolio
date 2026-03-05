@echo off
echo ================================================
echo   Riyaz Portfolio — Starting up...
echo ================================================
echo.

:: Check if node_modules exists
IF NOT EXIST "node_modules\" (
    echo First time setup — installing packages...
    echo This takes about 60 seconds. Please wait.
    echo.
    npm install
    echo.
    echo Setup complete!
    echo.
)

echo Starting the website...
echo.
echo When you see "Local: http://localhost:3000"
echo your browser will open automatically.
echo.
echo To stop the server, press Ctrl+C in this window.
echo.

npm run dev
pause
