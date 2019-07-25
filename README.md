**What's up Docker?** notifies when a new version of a Docker image you use is found.

## How does it work?

## How to start?
### The Docker way
Run the _What's up Docker?_ image with Docker.
```shell script
docker run \
    -d \
    --name wud \
    -- env WUD_LOG_LEVEL=debug \
    --volume /var/run/docker.sock:/var/run/docker.sock
    fmartinou/whats-up-docker
```

### The node.js way
TODO

## How to configure?
All configuration is set using environment variables.

### Schedulers
| Env var                               | Description           | Default value  |
| ------------------------------------- |:---------------------:|:--------------:| 
| WUD_SCHEDULER_CRON_${_schedulerName_} | Valid CRON expression | * * * * *      |

### Inputs
TODO

### Outputs
TODO

## How to contribute?
All contributions are welcome!
