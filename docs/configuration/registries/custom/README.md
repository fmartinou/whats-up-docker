# CUSTOM (Self-hosted Docker Registry)
![logo](custom.png)

The `custom` registry lets you configure a self-hosted [Docker Registry](https://docs.docker.com/registry/) integration.

### Variables

| Env var                        | Required       | Description                                                     | Supported values                                     | Default value when missing |
| ------------------------------ |:--------------:| --------------------------------------------------------------- | ---------------------------------------------------- | -------------------------- | 
| `WUD_REGISTRY_CUSTOM_URL`      | :red_circle:   | Registry URL (e.g. http://localhost:5000)                       |                                                      |                            |
| `WUD_REGISTRY_CUSTOM_LOGIN`    | :white_circle: | Login (when htpasswd auth is enabled on the registry)           | WUD_REGISTRY_CUSTOM_PASSWORD must be defined         |                            |
| `WUD_REGISTRY_CUSTOM_PASSWORD` | :white_circle: | Password (when htpasswd auth is enabled on the registry)        | WUD_REGISTRY_CUSTOM_LOGIN must be defined            |                            |
| `WUD_REGISTRY_CUSTOM_AUTH`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | WUD_REGISTRY_CUSTOM_LOGIN/TOKEN  must not be defined |                            |
### Examples

#### Configure for anonymous access
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_CUSTOM_URL=http://localhost:5000
```
#### **Docker**
```bash
docker run \
  -e "WUD_REGISTRY_CUSTOM_URL=http://localhost:5000" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Configure [for Basic Auth](https://docs.docker.com/registry/configuration/#htpasswd)
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_CUSTOM_URL=http://localhost:5000
      - WUD_REGISTRY_CUSTOM_LOGIN=john
      - WUD_REGISTRY_CUSTOM_PASSWORD=doe
```
#### **Docker**
```bash
docker run \
  -e "WUD_REGISTRY_CUSTOM_URL=http://localhost:5000" \
  -e "WUD_REGISTRY_CUSTOM_LOGIN=john" \
  -e "WUD_REGISTRY_CUSTOM_PASSWORD=doe" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->
