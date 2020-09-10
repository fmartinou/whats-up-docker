## Docker Hub Registry
![logo](docker.png)

The Docker watcher can find new versions of Images hosted on the [Docker Hub](https://hub.docker.com/).

### Variables

| Env var                                                          | Description                                    |                                                              | Supported values | Default value |
| ---------------------------------------------------------------- |:----------------------------------------------:|:------------------------------------------------------------:|:----------------:|               |
| `WUD_WATCHER_DOCKER_{watcher_name}_REGISTRIES_HUB_AUTH_LOGIN`    | Docker Login (for private repositories)        |                                                              |                  |               |
| `WUD_WATCHER_DOCKER_{watcher_name}_REGISTRIES_HUB_AUTH_PASSWORD` | Docker Access Token (for private repositories) | Docker Access Token or Base64(dockerlogin:dockerAccessToken) |                  |               |

### Examples

#### Configure Authentication on the default LOCAL Docker Watcher to access private repositories
```bash
"WUD_WATCHER_DOCKER_LOCAL_REGISTRIES_HUB_AUTH_LOGIN": "mylogin",
"WUD_WATCHER_DOCKER_LOCAL_REGISTRIES_HUB_AUTH_PASSWORD": "fb4d5db9-e64d-3648-8846-74d0846e55de"
```

#### Configure Authentication on the default LOCAL Docker Watcher to access private repositories using Base64(login:password)
```bash
"WUD_WATCHER_DOCKER_LOCAL_REGISTRIES_HUB_AUTH_PASSWORD": "bXlzdXBlcm9yZ2FuaXphdGlvbjpmYjRkNWRiOS1lNjRkLTM2NDgtODg0Ni03NGQwODQ2ZTU1ZGU="
```
