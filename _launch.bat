@echo off
call npm i --omit=dev
call node .
echo Aie: Le robot a crash� !!
echo Merci de copier le message ci-dessus et de l'envoyer au d�veloppeur.
echo Puis, quittez cette fen�tre et relancer le robot (par le fichier 'launch.bat')
pause
