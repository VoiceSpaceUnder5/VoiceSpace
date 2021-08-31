#!/bin/bash
sudo docker build -t vs_frontend:latest .
sudo docker run --name vs_frontend -p 80:80 -p 443:443 -d vs_frontend
