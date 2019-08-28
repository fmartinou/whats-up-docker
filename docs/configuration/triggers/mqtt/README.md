## Mqtt
![logo](mqtt.png)

The ```mqtt``` trigger lets you send image update notifications to an MQTT broker.

### Variables

| Env var                                        | Description                                      | Supported values                    | Default value |
|:----------------------------------------------:|:------------------------------------------------:|:-----------------------------------:|:-------------:| 
| ```WUD_TRIGGER_MQTT_{trigger_name}_URL```      | The URL of the MQTT broker                       | Valid mqtt, mqtts, tcp, ws, wss url |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_USER```     | The username if broker authentication is enabled |                                     |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_PASSWORD``` | The password if broker authentication is enabled |                                     |               |

### Examples

#### Post a maessage  to maqiatto broker

```bash
WUD_TRIGGER_MQTT_MAQIATTO_URL="tcp://maqiatto.com:1883"
WUD_TRIGGER_MQTT_MAQIATTO_USER="john@doe.com"
WUD_TRIGGER_MQTT_MAQIATTO_PASSWORD="mysecretpassword"
WUD_TRIGGER_MQTT_MAQIATTO_TOPIC="john@doe.com/wud/image"

```

#### Example of sent message
```javascript
{
  "registry": "https://hub.docker.com",
  "organization": "library",
  "image": "traefik",
  "version": "1.7.13",
  "date": "2019-08-08T22:30:47.914Z",
  "architecture": "amd64",
  "os": "linux",
  "size": 79293686,
  "isSemver": true,
  "result": {
    "newVersion": "1.7.14",
    "newVersionDate": "2019-08-15T07:50:43.122622Z"
  }
}
```
