## Docker

The ```docker``` watcher lets you configure which Docker hosts you want to watch.
For fine tuning, you can also add some labels to the containers you run.

### Variables

| Env var                                                | Description                               | Supported values                               | Default value          |
| ------------------------------------------------------ |:-----------------------------------------:|:----------------------------------------------:|:----------------------:| 
| ```WUD_WATCHER_DOCKER_{watcher_name}_SOCKETPATH```     | Docker socket to watch                    |                                                | /var/run/docker.sock   |
| ```WUD_WATCHER_DOCKER_{watcher_name}_CRON```           | Scheduling options                        | [Valid CRON expression](https://crontab.guru/) | 0 * * * * (every hour) |
| ```WUD_WATCHER_DOCKER_{watcher_name}_WATCHBYDEFAULT``` | If WUD monitors all containers by default | Valid boolean                                  | true                   |

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

## Docker labels
On every container you run, you can add some labels.  
For example, if you disable ```WUD_WATCHER_DOCKER_{watcher_name}_WATCHBYDEFAULT```, you need to add the ```wud.watch=true``` label.

## Supported labels
| Label                 | Description                         | Supported values       |
| --------------------- |:-----------------------------------:|:----------------------:|
| ```wud.watch```       | Watch this container                | Valid Boolean          |
| ```wud.tag.include``` | Regex to include specific tags only | Valid JavaScript Regex |
| ```wud.tag.exclude``` | Regex to exclude specific tags      | Valid JavaScript Regex |

### Examples

#### Include only 3 digits semver tags

```bash
# Docker run example
docker run -d --name mariadb --label wud.tag.include='^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$$' mariadb:10.4.5
```

```bash
# Docker Compose example
version: '3'

services:

    mariadb:
        image: mariadb:10.4.5
        labels:
            - 'wud.tag.include=^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$$'
```
