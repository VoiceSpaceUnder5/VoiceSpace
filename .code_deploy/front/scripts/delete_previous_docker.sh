#!/bin/bash
echo hi > test.txt
isExistApp=$(sudo docker ps | grep 443 | cut -f 1 -d " ")

if [ -n $isExistApp ]; then
sudo docker stop vs_frontend
sudo docker rm vs_frontend
fi
