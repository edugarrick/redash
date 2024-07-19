#!/bin/bash

docker run --name=builder --rm -v /var/run/docker.sock:/var/run/docker.sock --env-file=build.env -it asia.gcr.io/prime-odyssey-231510/builder:PER-183-builder-allow-building-github-re /home/build_docker.sh
