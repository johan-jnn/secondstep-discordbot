@echo off
rm -r .production
mkdir .production\dist
powershell cp .\_launch.bat, .\package.json .\.production\
powershell cp -r .\dist .\.production
echo Done !