## Quick start

### What is that?
**What's up Docker** ( aka _**WUD**_ ) gets you notified when a new version of your Docker Container is available.  

WUD is built on top of 3 concepts:
- **WATCHERS** which periodically query your Docker hosts to get the running images
- **REGISTRIES** which check if updates are available
- **TRIGGERS** to get you notified when an update is available

![image](./wud.png)

### Getting started
The easiest way to start is to deploy the official _**WUD**_ image and lets him monitor the Docker host on which WUD is deployed.

```bash
docker run -d --name wud -v "/var/run/docker.sock:/var/run/docker.sock" -p 3000:3000 fmartinou/whats-up-docker
```

[Open the UI](http://localhost:3000) in a browser and check if everything is working as expected.

```bash
    docker container logs -f wud
```

##### Everything ok?  
?> It's time to [add some triggers](/triggers/).

##### Need to finely configure how WUD must watch your containers?  
?> Take a look at the [watcher documentation](/watchers/).

##### Need to configure specific registries? (ECR, GCR...)?  
?> Take a look at the [registry documentation](/registries/).
