@echo off
set "PYTHON_PATH=%~dp0.venv\Scripts\python.exe"
set "MANAGE_PATH=%~dp0manage.py"

if not exist "%PYTHON_PATH%" (
  echo L'environnement Python attendu est introuvable: "%PYTHON_PATH%"
  exit /b 1
)

"%PYTHON_PATH%" "%MANAGE_PATH%" runserver %*
