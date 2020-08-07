## Docker

The ```docker``` watcher lets you configure which Docker hosts you want to watch.
For fine tuning, you can also add some labels to the containers you run.

### Variables

| Env var                                            | Description                                | Supported values                               | Default value          |
| -------------------------------------------------- |:------------------------------------------:|:----------------------------------------------:|:----------------------:| 
| `WUD_WATCHER_DOCKER_{watcher_name}_SOCKET`         | Docker socket to watch                     | Valid unix socker                              | /var/run/docker.sock   |
| `WUD_WATCHER_DOCKER_{watcher_name}_HOST`           | Docker hostname or ip of the host to watch |                                                |                        |
| `WUD_WATCHER_DOCKER_{watcher_name}_PORT`           | Docker port of the host to watch           |                                                | 2375                   |
| `WUD_WATCHER_DOCKER_{watcher_name}_CRON`           | Scheduling options                         | [Valid CRON expression](https://crontab.guru/) | 0 * * * * (every hour) |
| `WUD_WATCHER_DOCKER_{watcher_name}_WATCHBYDEFAULT` | If WUD monitors all containers by default  | Valid boolean                                  | true                   |

!> Socker configuration and host/port configuration are mutually exclusive

!> If socket configuration is used, don't forget to mount the Docker socket on your WUD container.

!> If host/port configuration is used, don't forget to enable the Docker remote API ([See dockerd documentation](https://docs.docker.com/v17.09/engine/reference/commandline/dockerd/#description)).

!> If no watcher is configured, a default one will be automatically created (watching local Docker socket)


### Examples

#### Watch local docker host every day at 1am

```bash
WUD_WATCHER_DOCKER_LOCAL_CRON="0 1 * * *"
```

#### Watch remote docker host on 2375 port every hour

```bash
WUD_WATCHER_DOCKER_MYREMOTEHOST_HOST="myremotehost"
```

#### Watch remote docker host on 2376 port every hour

```bash
WUD_WATCHER_DOCKER_MYREMOTEHOST_HOST="myremotehost"
WUD_WATCHER_DOCKER_MYREMOTEHOST_PORT="2376"
```

#### Watch a local and 2 other remote docker hosts on 2375 port

```bash
WUD_WATCHER_DOCKER_LOCAL_SOCKET="/var/run/docker.sock"
WUD_WATCHER_DOCKER_MYREMOTEHOST1_HOST="myremotehost1"
WUD_WATCHER_DOCKER_MYREMOTEHOST2_HOST="myremotehost2"
```

### Docker labels
To fine-tune the behaviour of WUD, [you can add labels on your containers](configuration/watchers/labels).