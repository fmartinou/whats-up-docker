## Mqtt
![logo](mqtt.png)

The ```mqtt``` trigger lets you send image update notifications to an MQTT broker.

### Variables

| Env var                                        | Description                                      | Supported values                    | Default value |
|:----------------------------------------------:|:------------------------------------------------:|:-----------------------------------:|:-------------:| 
| ```WUD_TRIGGER_MQTT_{trigger_name}_URL```      | The URL of the MQTT broker                       | Valid mqtt, mqtts, tcp, ws, wss url |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_USER```     | The username if broker authentication is enabled |                                     |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_PASSWORD``` | The password if broker authentication is enabled |                                     |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_TOPIC```    | The topic where the updates are published to     |                                     | wud/image     |

### Examples

#### Post a message to a local mosquitto broker

```bash
WUD_TRIGGER_MQTT_MOSQUITTO_URL="mqtt://localhost:1883"
```

#### Post a message to a maqiatto broker

```bash
WUD_TRIGGER_MQTT_MAQIATTO_URL="tcp://maqiatto.com:1883"
WUD_TRIGGER_MQTT_MAQIATTO_USER="john@doe.com"
WUD_TRIGGER_MQTT_MAQIATTO_PASSWORD="mysecretpassword"
WUD_TRIGGER_MQTT_MAQIATTO_TOPIC="john@doe.com/wud/image"
```

#### Example of sent message
```javascript
{
  "id":"657a87c8-7926-4e97-815b-60bb9fdada2a",
  "trigger":"https://hub.docker.com",
  "organization":"library",
  "image":"mariadb",
  "version":"10.3.13",
  "versionDate":"2019-03-12T01:01:32.052509774Z",
  "architecture":"amd64",
  "os":"linux",
  "size":368482149,
  "isSemver":true,
  "result":{
     "newVersion":"10.5.4-focal",
     "newVersionDate":"2020-07-24T19:28:44.541114Z"
  },
  "created":"2020-08-09T17:19:42.789Z",
  "updated":"2020-08-10T11:00:01.365Z"
}
```
