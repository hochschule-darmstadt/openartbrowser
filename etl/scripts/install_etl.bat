cd ..
REM Add directory to PYTHONPATH, this enables imports in python3
setx PYTHONPATH "%PYTHONPATH%;%CD%" /M
REM Add directory to PYWIKIBOT_DIR, this enables execution of data_extraction scripts in any directory
setx PYWIKIBOT_DIR "%CD%" /M
