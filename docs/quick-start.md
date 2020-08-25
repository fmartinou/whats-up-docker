## Quick start

**What's up Docker** ( aka _**WUD**_ ) gets you notified when a new version of your Docker Container is available.  

It periodically watches your Docker hosts to:

- **Detect** which images you're running
- **Find** which images can be updated
- **Trigger** actions to let you react the way you want

The easiest way to start is to deploy the official _**WUD**_ image and lets him monitor the Docker host on which WUD is deployed.

```bash
docker run -d --name wud \
-e "WUD_LOG_LEVEL="DEBUG" \ 
-v "/var/run/docker.sock:/var/run/docker.sock" \
-p 3000:3000 \
fmartinou/whats-up-docker
```

You can now watch the logs to check if everything is working as expected.

```bash
    docker container logs -f wud
```

Everything ok?  
It's time to [add some triggers](/triggers/).
