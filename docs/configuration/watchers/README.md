# Docker Watchers
![logo](docker.png)

Watchers are responsible for scanning Docker containers.

The ```docker``` watcher lets you configure the Docker hosts you want to watch.

## Variables

| Env var                                                   | Required       | Description                                                     | Supported values                               | Default value when missing                                      |
| --------------------------------------------------------- |:--------------:| --------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- | 
| `WUD_WATCHER_{watcher_name}_SOCKET`                       | :white_circle: | Docker socket to watch                                          | Valid unix socket                              | `/var/run/docker.sock`                                          |
| `WUD_WATCHER_{watcher_name}_HOST`                         | :white_circle: | Docker hostname or ip of the host to watch                      |                                                |                                                                 |
| `WUD_WATCHER_{watcher_name}_PORT`                         | :white_circle: | Docker port of the host to watch                                |                                                | `2375`                                                          |
| `WUD_WATCHER_{watcher_name}_CAFILE`                       | :white_circle: | CA pem file path (only for TLS connection)                      |                                                |                                                                 |
| `WUD_WATCHER_{watcher_name}_CERTFILE`                     | :white_circle: | Certificate pem file path (only for TLS connection)             |                                                |                                                                 |
| `WUD_WATCHER_{watcher_name}_KEYFILE`                      | :white_circle: | Key pem file path (only for TLS connection)                     |                                                |                                                                 |
| `WUD_WATCHER_{watcher_name}_CRON`                         | :white_circle: | Scheduling options                                              | [Valid CRON expression](https://crontab.guru/) | `0 * * * *` (every hour)                                        |
| `WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT`               | :white_circle: | If WUD must monitor all containers by default                   | `true`, `false`                                | `true`                                                          |
| `WUD_WATCHER_{watcher_name}_WATCHALL`                     | :white_circle: | If WUD must monitor all containers instead of just running ones | `true`, `false`                                | `false`                                                         |
| `WUD_WATCHER_{watcher_name}_WATCHEVENTS`                  | :white_circle: | If WUD must monitor docker events                               | `true`, `false`                                | `true`                                                          |
| ~~`WUD_WATCHER_{watcher_name}_WATCHDIGEST`~~ (deprecated) | :white_circle: | If WUD must monitor container digests                           |                                                | `false` for semver image tags, `true` for non semver image tags |

?> If no watcher is configured, a default one named `local` will be automatically created (reading the Docker socket).

?> Multiple watchers can be configured (if you have multiple Docker hosts to watch).  
You just need to give them different names.

!> Socket configuration and host/port configuration are mutually exclusive.

!> If socket configuration is used, don't forget to mount the Docker socket on your WUD container.

!> If host/port configuration is used, don't forget to enable the Docker remote API. \
[See dockerd documentation](https://docs.docker.com/engine/reference/commandline/dockerd/#description)

!> If the Docker remote API is secured with TLS, don't forget to mount and configure the TLS certificates. \
[See dockerd documentation](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket)

!> Watching image digests causes an extensive usage of _Docker Registry Pull API_ which is restricted by [**Quotas on the Docker Hub**](https://docs.docker.com/docker-hub/download-rate-limit/). \
By default, WUD enables it only for **non semver** image tags. \
You can tune this behavior per container using the `wud.watch.digest` label. \
If you face [quota related errors](https://docs.docker.com/docker-hub/download-rate-limit/#how-do-i-know-my-pull-requests-are-being-limited), consider slowing down the watcher rate by adjusting the `WUD_WATCHER_{watcher_name}_CRON` variable.

## Variable examples

### Watch the local docker host every day at 1am

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

### Watch all containers regardless of their status (created, paused, exited, restarting, running...)

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

### Watch a remote docker host via TCP on 2375

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

### Watch a remote docker host via TCP with TLS enabled on 2376

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

### Watch 1 local Docker host and 2 remote docker hosts at the same time

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

## Labels

To fine-tune the behaviour of WUD _per container_, you can add labels on them.

| Label               |    Required    | Description                                        | Supported values                                                                                                                                                            | Default value when missing                                                            |
|---------------------|:--------------:|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `wud.watch`         | :white_circle: | Watch this container                               | Valid Boolean                                                                                                                                                               | `true` when `WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT` is `true` (`false` otherwise) |
| `wud.watch.digest`  | :white_circle: | Watch this container digest                        | Valid Boolean                                                                                                                                                               | `false`                                                                               |
| `wud.tag.include`   | :white_circle: | Regex to include specific tags only                | Valid JavaScript Regex                                                                                                                                                      |                                                                                       |
| `wud.tag.exclude`   | :white_circle: | Regex to exclude specific tags                     | Valid JavaScript Regex                                                                                                                                                      |                                                                                       |
| `wud.tag.transform` | :white_circle: | Transform function to apply to the tag             | `$valid_regex => $valid_string_with_placeholders` (see below)                                                                                                               |                                                                                       |
| `wud.link.template` | :white_circle: | Browsable link associated to the container version | String template with placeholders `${raw}` `${major}` `${minor}` `${patch}` `${prerelease}`                                                                                 |                                                                                       |
| `wud.display.name`  | :white_circle: | Custom display name for the container              | Valid String                                                                                                                                                                | Container name                                                                        |
| `wud.display.icon`  | :white_circle: | Custom display icon for the container              | Valid [Material Design Icon](https://materialdesignicons.com/), [Fontawesome Icon](https://fontawesome.com/) or [Simple icon](https://simpleicons.org/) (see details below) | `mdi:docker`                                                                          |

## Label examples

### Include specific containers to watch
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
      - wud.watch=true
```

#### **Docker**
```bash
docker run -d --name mariadb --label wud.watch=true mariadb:10.4.5
```
<!-- tabs:end -->

### Exclude specific containers to watch
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
      - wud.watch=false
```

#### **Docker**
```bash
docker run -d --name mariadb --label wud.watch=false mariadb:10.4.5
```
<!-- tabs:end -->

### Include only 3 digits semver tags
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

### Transform the tags before performing the analysis
In certain cases, tag values are so badly formatted that the resolution algorithm cannot find any valid update candidates or, worst, find bad positive matches.

For example, you can encounter such an issue if you need to deal with tags looking like `1.0.0-99-7b368146`, `1.0.0-273-21d7efa6`...  
By default, WUD will report bad positive matches because of the `sha-1` part at the end of the tag value (`-7b368146`...).  
That's a shame because `1.0.0-99` and `1.0.0-273` would have been valid semver values (`$major.$minor.$patch-$prerelease`).

You can get around this issue by providing a function that keeps only the part you are interested in.  

How does it work?  
The transform function must follow the following syntax:
```
$valid_regex_with_capturing_groups => $valid_string_with_placeholders
```

For example:
```bash
^(\d+\.\d+\.\d+-\d+)-.*$ => $1
```

The capturing groups are accessible with the syntax `$1`, `$2`, `$3`.... 

!> The first capturing group is accessible as `$1`! 

For example, you can indicate that you want to watch x.y.z versions only
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:

  searx:
    image: searx/searx:1.0.0-269-7b368146
    labels:
      - wud.tag.include=^\d+\.\d+\.\d+-\d+-.*$$
      - wud.tag.transform=^(\d+\.\d+\.\d+-\d+)-.*$$ => $$1
```

#### **Docker**
```bash
docker run -d --name searx \
--label 'wud.tag.include=^\d+\.\d+\.\d+-\d+-.*$' \
--label 'wud.tag.transform=^(\d+\.\d+\.\d+-\d+)-.*$ => $1' \
searx/searx:1.0.0-269-7b368146
```
<!-- tabs:end -->

### Enable digest watching
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

### Associate a link to the container version
You can associate a browsable link to the container version using a templated string.
For example, if you want to associate a mariadb version to a changelog (e.g. https://mariadb.com/kb/en/mariadb-1064-changelog),

you would specify a template like `https://mariadb.com/kb/en/mariadb-${major}${minor}${patch}-changelog`

The available placeholders are:
- `${raw}` the full unparsed version
- `${major}` the major version (if valid semver)
- `${minor}` the minor version (if valid semver)
- `${patch}` the patch version (if valid semver)
- `${prerelease}` the prerelease version (if valid semver)

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:

  mariadb:
    image: mariadb:10.6.4
    labels:
      - wud.link.template=https://mariadb.com/kb/en/mariadb-$${major}$${minor}$${patch}-changelog
```

#### **Docker**
```bash
docker run -d --name mariadb --label 'wud.link.template=https://mariadb.com/kb/en/mariadb-${major}${minor}${patch}-changelog' mariadb:10
```
<!-- tabs:end -->

### Customize the name and the icon to display
You can customize the name & the icon of a container (displayed in the UI, in Home-Assistant...)

Icons must be prefixed with:
- `mdi:` or `mdi-` for [Material Design icons](https://materialdesignicons.com/) (`mdi:database`, `mdi-server`...)
- `fab:` or `fab-` for [Fontawesome brand icons](https://fontawesome.com/) (`fab:github`, `fab-mailchimp`...)
- `far:` or `far-` for [Fontawesome regular icons](https://fontawesome.com/) (`far:heart`, `far-house`...)
- `fas:` or `fas-` for [Fontawesome solid icons](https://fontawesome.com/) (`fas:heart`, `fas-house`...)
- `si:` or `si-` for [Simple icons](https://simpleicons.org/) (`si:mysql`, `si-plex`...)

?> If you want to display Fontawesome icons or Simple icons in Home-Assistant, you need to install first the [HASS-fontawesome](https://github.com/thomasloven/hass-fontawesome) and the [HASS-simpleicons](https://github.com/vigonotion/hass-simpleicons) components.

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:

  mariadb:
    image: mariadb:10.6.4
    labels:
      - wud.display.name=Maria DB
      - wud.display.icon=si:mariadb
```

#### **Docker**
```bash
docker run -d --name mariadb --label 'wud.display.name=Maria DB' --label 'wud.display.icon=mdi-database' mariadb:10
```
<!-- tabs:end -->
