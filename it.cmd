@ECHO OFF
ECHO "it.bat running"
ECHO "Running against Prod"

#delete existing screenshots, we produce screenshots off of prod as our baseline and off of dev to diff against
set folder="it-screenshots"
cd /d %folder%
for /F "delims=" %%i in ('dir /b') do (rmdir "%%i" /s/q || del "%%i" /s/q)

cd ..

casperjs.bat test it.js --gsheetID=1nGe_NUfDQEWrdH6Vtd3JVO3pwKpsf-sr9JfvyMA0zfc --rootURL=http://it.stonybrook.edu --engine=slimerjs
