@echo off
echo Starting EV Management System...
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo Starting the application...
call npm run dev

pause 