@echo off
call npm i --omit=dev
call node .
echo Aie: Le robot a crashé !!
echo Merci de copier le message ci-dessus et de l'envoyer au développeur.
echo Puis, quittez cette fenêtre et relancer le robot (par le fichier 'launch.bat')
pause
