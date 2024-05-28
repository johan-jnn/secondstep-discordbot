@echo off
powershell cp .\launch.bat, .\.env, .\package.json, .\settings.yaml, .\webhooks.json .\.production\
mkdir .production\dist
powershell cp -r .\dist ".\.production\dist"
echo Done !