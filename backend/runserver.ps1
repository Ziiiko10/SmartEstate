$pythonPath = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$managePath = Join-Path $PSScriptRoot "manage.py"

if (-not (Test-Path $pythonPath)) {
    Write-Error "L'environnement Python attendu est introuvable: $pythonPath"
    exit 1
}

& $pythonPath $managePath runserver @args
