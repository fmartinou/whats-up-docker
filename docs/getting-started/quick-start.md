## Quick start

The easiest way to start is to deploy the official WUD image and lets him monitor the Docker host on which WUD is deployed.

```bash
docker run -d --name wud \
-e "WUD_LOG_LEVEL="DEBUG" # <- adjust log level to DEBUG to see things in the logs \
-e "WUD_WATCHER_DOCKER_LOCAL_SOCKETPATH="/var/run/docker.sock" \ # <- configure WUD sto listen to local Docker socket
-v "/var/run/docker.sock:/var/run/docker.sock" \                 # <- don't forget to mount local Docker socket from host to WUD container
fmartinou/whats-up-docker
```

You can now watch the logs to check if everything is working as expected.

```bash
    docker container logs -f wud
```

Everything ok?  
It's time to [add some triggers](/configuration/triggers/).