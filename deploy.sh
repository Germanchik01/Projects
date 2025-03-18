#!/bin/bash

# Скрипт для автоматического развертывания To-Do List

echo "Развертывание To-Do List..."

# Проверка наличия веб-сервера (например, Python SimpleHTTPServer)
if ! command -v python3 &> /dev/null
then
    echo "Python3 не найден. Пожалуйста, установите Python3."
    exit 1
fi

# Запуск веб-сервера в фоне
echo "Запуск веб-сервера на http://localhost:8000..."
python3 -m http.server 8000 &

echo "Развертывание завершено. Откройте http://localhost:8000 в вашем браузере."
exit 0