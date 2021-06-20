# Quick start

## Run the Docker image
The easiest way to start is to deploy the official _**WUD**_ image.

```bash
docker run -d --name wud -v "/var/run/docker.sock:/var/run/docker.sock" -p 3000:3000 fmartinou/whats-up-docker
```

## Check the logs
```bash
docker container logs wud
```

## Open the UI
[Open the UI](http://localhost:3000) in a browser and check that everything is working as expected.

## Add your first trigger   
?> Everything ok? \
It's time to [add some triggers](configuration/triggers/)!

## Going deeper...
  
?> Need to fine configure how WUD must watch your containers? \
Take a look at the [watcher documentation](configuration/watchers/)!
  
?> Need to integrate other registries (ECR, GCR...)? \
Take a look at the [registry documentation](configuration/registries/).
