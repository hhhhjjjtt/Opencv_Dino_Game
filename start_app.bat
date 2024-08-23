@echo off
echo Starting Flask server...
call venv\Scripts\activate
start python server.py
timeout 2
start http://localhost:5000
echo Server is running at http://localhost:5000
echo Flask server was stopped. Press any key to close this window.
pause