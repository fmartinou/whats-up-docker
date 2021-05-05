## Docker
![logo](docker.png)

The ```docker``` watcher lets you configure which Docker hosts you want to watch.

### Variables

| Env var                                     | Description                                                     | Supported values                                   | Default value          |
| ------------------------------------------- |:---------------------------------------------------------------:|:--------------------------------------------------:|:----------------------:| 
| `WUD_WATCHER_{watcher_name}_SOCKET`         | Docker socket to watch                                          | Valid unix socket                                  | /var/run/docker.sock   |
| `WUD_WATCHER_{watcher_name}_HOST`           | Docker hostname or ip of the host to watch                      |                                                    |                        |
| `WUD_WATCHER_{watcher_name}_PORT`           | Docker port of the host to watch                                |                                                    | 2375                   |
| `WUD_WATCHER_{watcher_name}_CAFILE`         | CA pem file path (only for TLS connection)                      |                                                    |                        |
| `WUD_WATCHER_{watcher_name}_CERTFILE`       | Certificate pem file path (only for TLS connection)             |                                                    |                        |
| `WUD_WATCHER_{watcher_name}_KEYFILE`        | Key pem file path (only for TLS connection)                     |                                                    |                        |
| `WUD_WATCHER_{watcher_name}_CRON`           | Scheduling options                                              | [Valid CRON expression](https://crontab.guru/)     | 0 * * * * (every hour) |
| `WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT` | If WUD must monitor all containers by default                   | Valid boolean                                      | true                   |
| `WUD_WATCHER_{watcher_name}_WATCHALL`       | If WUD must monitor all containers instead of just running ones | Valid boolean                                      | false                  |

?> If no watcher is configured, a default one named `local` will be automatically created (reading the Docker socket).

?> Multiple watchers can be configured (if you have multiple Docker hosts to watch).  
You just need to give them different names.

!> Socket configuration and host/port configuration are mutually exclusive.

!> If socket configuration is used, don't forget to mount the Docker socket on your WUD container.

!> If host/port configuration is used, don't forget to enable the Docker remote API. \
[See dockerd documentation](https://docs.docker.com/engine/reference/commandline/dockerd/#description)

!> If the Docker remote API is secured with TLS, don't forget to mount and configure the TLS certificates. \  
[See dockerd documentation](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket)

### Examples

#### Watch the local docker host every day at 1am

```bash
WUD_WATCHER_LOCAL_CRON="0 1 * * *"
```

#### Watch all containers regardless of their status (created, paused, exited, restarting, running...)

```bash
WUD_WATCHER_LOCAL_WATCHALL="true"
```

#### Watch a remote docker host via TCP on 2375

```bash
WUD_WATCHER_MYREMOTEHOST_HOST="myremotehost"
```

#### Watch a remote docker host via TCP with TLS enabled on 2376

```bash
WUD_WATCHER_MYREMOTEHOST_HOST="myremotehost"
WUD_WATCHER_MYREMOTEHOST_PORT="2376"
WUD_WATCHER_MYREMOTEHOST_CAFILE="/certs/ca.pem"
WUD_WATCHER_MYREMOTEHOST_CERTFILE="/certs/cert.pem"
WUD_WATCHER_MYREMOTEHOST_KEYFILE="/certs/key.pem"
```

!> Don't forget to mount the certificates into the container!

```
...
-v /my-host/my-certs/ca.pem:/certs/ca.pem \
-v /my-host/my-certs/ca.pem:/certs/cert.pem \
-v /my-host/my-certs/ca.pem:/certs/key.pem \
...
```

#### Watch 1 local Docker host and 2 remote docker hosts at the same time

```bash
WUD_WATCHER_LOCAL_SOCKET="/var/run/docker.sock"
WUD_WATCHER_MYREMOTEHOST1_HOST="myremotehost1"
WUD_WATCHER_MYREMOTEHOST2_HOST="myremotehost2"
```

### Docker labels
To fine-tune the behaviour of WUD, [you can add labels on your containers](watchers/labels).
