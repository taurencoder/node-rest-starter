#!/usr/bin/env bash
docker run --name backend-api \
-v /root/volumns/backend-api:/app/logs \
-p 9000:9000 -d --restart always backend-api
