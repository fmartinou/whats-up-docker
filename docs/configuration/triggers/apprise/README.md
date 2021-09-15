# Apprise
![logo](apprise.png)

The `apprise` trigger lets you send container update notifications via the [Apprise API](https://github.com/caronc/apprise-api).

### Variables

| Env var                                   | Required     | Description                                                                                            | Supported values             | Default value when missing |
| ----------------------------------------- |:------------:| ------------------------------------------------------------------------------------------------------ | ---------------------------- | -------------------------- | 
| `WUD_TRIGGER_APPRISE_{trigger_name}_URL`  | :red_circle: | The Base URL of the Apprise API                                                                        |                              |                            |
| `WUD_TRIGGER_APPRISE_{trigger_name}_URLS` | :red_circle: | [Supported Apprise notification URLs](https://github.com/caronc/apprise#popular-notification-services) | Comma separated list of urls |                            |

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration)

### Examples

#### Send a Mail & an SMS

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_TRIGGER_APPRISE_LOCAL_URL=http://apprise:8000
      - WUD_TRIGGER_APPRISE_LOCAL_URLS=mailto://john.doe:secret@gmail.com,sns://AHIAJGNT76XIMXDBIJYA/bu1dHSdO22pfaaVy/wmNsdljF4C07D3bndi9PQJ9/us-east-2/+1(800)555-1223
```
#### **Docker**
```bash
docker run \
  -e WUD_TRIGGER_APPRISE_LOCAL_URL="http://apprise:8000" \
  -e WUD_TRIGGER_APPRISE_LOCAL_URLS="mailto://john.doe:secret@gmail.com,sns://AHIAJGNT76XIMXDBIJYA/bu1dHSdO22pfaaVy/wmNsdljF4C07D3bndi9PQJ9/us-east-2/+1(800)555-1223" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

### How to run the Apprise API?
Just run the official [Apprise Docker image](https://hub.docker.com/r/caronc/apprise).

For more information, check out the [official Apprise API documentation](https://github.com/caronc/apprise-api). 

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  apprise:
    image: caronc/apprise
    container_name: apprise
```
#### **Docker**
```bash
docker run caronc/apprise
```
<!-- tabs:end -->