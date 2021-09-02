#!/bin/bash

isExistApp=$(sudo docker ps | grep 443 | cut -f 1 -d " ")
if [[ -n ${isExistApp} ]]; then
sudo docker stop $isExistApp
sudo docker rm $isExistApp
fi

isExitedApp=$(sudo docker ps | grep vs_frontend | cut -f 1 -d " ")
if [[ -n ${isExitedApp} ]]; then
sudo docker rm $isExitedApp
fi

sudo docker rmi vs_frontend