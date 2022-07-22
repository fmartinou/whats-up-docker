# HOTIO (Hotio.dev Container Registry)
![logo](hotio.png)

The `hotio` registry lets you configure [HOTIO](https://hotio.dev) integration.

### Variables

| Env var              | Required       | Description                | Supported values  | Default value when missing |
|----------------------|:--------------:| -------------------------- | ----------------- | -------------------------- | 
| `WUD_REGISTRY_HOTIO` | :white_circle: | Set to enable the registry | `` (empty string) | undefined                  |

### Examples

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_HOTIO=
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_HOTIO= \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->
