# REST API

You can access _**WUD**_ state using the HTTP REST API. \
(see API details below)

By default, the API is enabled and exposed on port `3000`.

You can override this behaviour using the following environment variables.
### Variables

| Env var               | Required       | Description                   | Supported values    | Default value when misssing |
| --------------------- |:--------------:|------------------------------ | ------------------- | --------------------------- | 
| ```WUD_API_ENABLED``` | :white_circle: | If REST API must be exposed   | `true`, `false`     | `true`                      |
| ```WUD_API_PORT```    | :white_circle: | Http listener port            | from `0` to `65535` | `3000`                      |

### Examples

#### Disable http listener

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_API_ENABLED=false
```
#### **Docker**
```bash
docker run \
  -e WUD_API_ENABLED=false \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Set http listener port to 8080

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_API_PORT=8080
```
#### **Docker**
```bash
docker run \
  -e WUD_API_PORT=8080 \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->
