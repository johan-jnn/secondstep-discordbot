@echo off
rm -r .production
mkdir .production\dist
powershell cp .\launch.bat, .\package.json .\.production\
powershell cp -r .\dist .\.production
echo Done !