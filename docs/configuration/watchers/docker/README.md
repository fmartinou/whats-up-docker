### Docker
![logo](docker.png)

The ```docker``` watcher lets you configure the Docker hosts you want to watch.

## Variables

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

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        - WUD_WATCHER_LOCAL_CRON=0 1 * * *
```

#### **Docker**
```bash
docker run \
    -e WUD_WATCHER_LOCAL_CRON="0 1 * * *" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Watch all containers regardless of their status (created, paused, exited, restarting, running...)

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        - WUD_WATCHER_LOCAL_WATCHALL=true
```

#### **Docker**
```bash
docker run \
    -e WUD_WATCHER_LOCAL_WATCHALL="true" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Watch a remote docker host via TCP on 2375

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        - WUD_WATCHER_MYREMOTEHOST_HOST=myremotehost 
```

#### **Docker**
```bash
docker run \
    -e WUD_WATCHER_MYREMOTEHOST_HOST="myremotehost" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Watch a remote docker host via TCP with TLS enabled on 2376

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        - WUD_WATCHER_MYREMOTEHOST_HOST=myremotehost
        - WUD_WATCHER_MYREMOTEHOST_PORT=2376
        - WUD_WATCHER_MYREMOTEHOST_CAFILE=/certs/ca.pem
        - WUD_WATCHER_MYREMOTEHOST_CERTFILE=/certs/cert.pem
        - WUD_WATCHER_MYREMOTEHOST_KEYFILE=/certs/key.pem
    volumes:
        - /my-host/my-certs/ca.pem:/certs/ca.pem:ro
        - /my-host/my-certs/ca.pem:/certs/cert.pem:ro
        - /my-host/my-certs/ca.pem:/certs/key.pem:ro
```

#### **Docker**
```bash
docker run \
    -e WUD_WATCHER_MYREMOTEHOST_HOST="myremotehost" \
    -e WUD_WATCHER_MYREMOTEHOST_PORT="2376" \
    -e WUD_WATCHER_MYREMOTEHOST_CAFILE="/certs/ca.pem" \
    -e WUD_WATCHER_MYREMOTEHOST_CERTFILE="/certs/cert.pem" \
    -e WUD_WATCHER_MYREMOTEHOST_KEYFILE="/certs/key.pem" \
    -v /my-host/my-certs/ca.pem:/certs/ca.pem:ro \
    -v /my-host/my-certs/ca.pem:/certs/cert.pem:ro \
    -v /my-host/my-certs/ca.pem:/certs/key.pem:ro \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

!> Don't forget to mount the certificates into the container!

#### Watch 1 local Docker host and 2 remote docker hosts at the same time

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        -  WUD_WATCHER_LOCAL_SOCKET=/var/run/docker.sock
        -  WUD_WATCHER_MYREMOTEHOST1_HOST=myremotehost1
        -  WUD_WATCHER_MYREMOTEHOST2_HOST=myremotehost2
```

#### **Docker**
```bash
docker run \
    -e  WUD_WATCHER_LOCAL_SOCKET="/var/run/docker.sock" \
    -e  WUD_WATCHER_MYREMOTEHOST1_HOST="myremotehost1" \
    -e  WUD_WATCHER_MYREMOTEHOST2_HOST="myremotehost2" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

## Supported labels

To fine-tune the behaviour of WUD _per container_, you can add labels on them.

#### Supported labels
| Label                  | Description                         | Supported values       | Default value                                                                   |
| ---------------------- |:-----------------------------------:|:----------------------:|:-------------------------------------------------------------------------------:|
| ```wud.watch```        | Watch this container                | Valid Boolean          | true when `WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT` is true (false otherwise) |
| ```wud.watch.digest``` | Watch this container digest         | Valid Boolean          | false                                                                           |
| ```wud.tag.include```  | Regex to include specific tags only | Valid JavaScript Regex |                                                                                 |
| ```wud.tag.exclude```  | Regex to exclude specific tags      | Valid JavaScript Regex |                                                                                 |

!> Watching image digests cause extensive usage of _Docker Registry Pull API_ which is restricted by [**Quotas on the Docker Hub**](https://docs.docker.com/docker-hub/download-rate-limit/). \
We suggest enabling `wud.watch.digest` only where it's convenient (e.g. on `latest` versions). \
If you face [quota related errors](https://docs.docker.com/docker-hub/download-rate-limit/#how-do-i-know-my-pull-requests-are-being-limited), consider slowing down the watcher rate by adjusting the `WUD_WATCHER_{watcher_name}_CRON` variable.

#### Examples

##### Include specific containers to watch
Configure WUD to disable WATCHBYDEFAULT feature.
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_WATCHER_LOCAL_WATCHBYDEFAULT=false
```

#### **Docker**
```bash
docker run \
    -e WUD_WATCHER_LOCAL_WATCHBYDEFAULT="false" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

Then add the `wud.watch=true` label on the containers you want to watch.
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  mariadb:
    image: mariadb:10.4.5
    ...
    labels:
      wud.watch=true
```

#### **Docker**
```bash
docker run -d --name mariadb --label wud.watch=true mariadb:10.4.5
```
<!-- tabs:end -->

##### Exclude specific containers to watch
Ensure `WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT` is true (default value). 

Then add the `wud.watch=false` label on the containers you want to exclude from being watched.
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  mariadb:
    image: mariadb:10.4.5
    ...
    labels:
      wud.watch=false
```

#### **Docker**
```bash
docker run -d --name mariadb --label wud.watch=false mariadb:10.4.5
```
<!-- tabs:end -->

##### Include only 3 digits semver tags
You can filter (by inclusion or inclusion) which versions can be candidates for update.

For example, you can indicate that you want to watch x.y.z versions only
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:

  mariadb:
    image: mariadb:10.4.5
    labels:
      - wud.tag.include=^\d+\.\d+\.\d+$$
```

#### **Docker**
```bash
docker run -d --name mariadb --label 'wud.tag.include=^\d+\.\d+\.\d+$' mariadb:10.4.5
```
<!-- tabs:end -->

##### Enable digest watching
Additionally to semver tag tracking, you can also track if the digest associated to the local tag has been updated.  
It can be convenient to monitor image tags known to be overridden (`latest`, `10`, `10.6`...)

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:

  mariadb:
    image: mariadb:10
    labels:
      - wud.tag.include=^\d+$$
      - wud.watch.digest=true
```

#### **Docker**
```bash
docker run -d --name mariadb --label 'wud.tag.include=^\d+$' --label wud.watch.digest=true mariadb:10
```
<!-- tabs:end -->
