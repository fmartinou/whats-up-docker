## Docker

The ```docker``` watcher lets you configure which Docker hosts you want to watch.

### Variables

| Env var                                            | Description            | Supported values                               | Default value          |
| -------------------------------------------------- |:----------------------:|:----------------------------------------------:|:----------------------:| 
| ```WUD_WATCHER_DOCKER_{watcher_name}_SOCKETPATH``` | Docker socket to watch |                                                | /var/run/docker.sock   |
| ```WUD_WATCHER_DOCKER_{watcher_name}_CRON```       | Scheduling options     | [Valid CRON expression](https://crontab.guru/) | 0 * * * * (every hour) |

### Examples

#### Watch local docker host every hour

```bash
WUD_WATCHER_DOCKER_LOCAL_SOCKETPATH="/var/run/docker.sock"
```
!> Docker socket must be mounted inside your WUD container.

#### Watch remote docker host every day

```bash
WUD_WATCHER_DOCKER_MYREMOTEHOST_SOCKETPATH="https://myremotehost:2375"
WUD_WATCHER_DOCKER_LOCAL_CRON="0 0 * * *"
```
!> Docker remote API must be enabled ([See dockerd documentation](https://docs.docker.com/v17.09/engine/reference/commandline/dockerd/#description)).
