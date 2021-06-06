### Mqtt
![logo](mqtt.png)

The ```mqtt``` trigger lets you send container update notifications to an MQTT broker.

#### Variables

| Env var                                            | Description                                                         | Supported values                    | Default value |
|:--------------------------------------------------:|:-------------------------------------------------------------------:|:-----------------------------------:|:-------------:| 
| ```WUD_TRIGGER_MQTT_{trigger_name}_URL```          | The URL of the MQTT broker                                          | Valid mqtt, mqtts, tcp, ws, wss url |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_USER```         | The username if broker authentication is enabled                    |                                     |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_PASSWORD```     | The password if broker authentication is enabled                    |                                     |               |
| ```WUD_TRIGGER_MQTT_{trigger_name}_TOPIC```        | The base topic where the updates are published to                   |                                     | wud/container |
| ```WUD_TRIGGER_MQTT_{trigger_name}_HASS_ENABLED``` | Enable [Home-assistant](https://www.home-assistant.io/) integration | true / false                        | false         |
| ```WUD_TRIGGER_MQTT_{trigger_name}_HASS_PREFIX```  | Base topic for hass entity discovery                                |                                     | homeassistant |

#### Examples

##### Post a message to a local mosquitto broker

```bash
WUD_TRIGGER_MQTT_MOSQUITTO_URL="mqtt://localhost:1883"
```

##### Post a message to a maqiatto broker

```bash
WUD_TRIGGER_MQTT_MAQIATTO_URL="tcp://maqiatto.com:1883"
WUD_TRIGGER_MQTT_MAQIATTO_USER="john@doe.com"
WUD_TRIGGER_MQTT_MAQIATTO_PASSWORD="mysecretpassword"
WUD_TRIGGER_MQTT_MAQIATTO_TOPIC="john@doe.com/wud/image"
```

##### Example of sent message
```json
{
  "id":"31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816",
  "name":"homeassistant",
  "watcher":"local",
  "include_tags":"^\\d+\\.\\d+.\\d+$",
  "image_id":"sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6",
  "image_registry_url":"123456789.dkr.ecr.eu-west-1.amazonaws.com",
  "image_name":"test",
  "image_tag_value":"2021.6.4",
  "image_tag_semver":true,
  "image_digest_watch":false,
  "image_digest_repo":"sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72",
  "image_architecture":"amd64",
  "image_os":"linux",
  "image_created":"2021-06-12T05:33:38.440Z",
  "result_tag":"2021.6.5",
  "updateAvailable":"2021.6.5"
}
```

#### Home-Assistant integration
![logo](hass.png)

WUD can be easily integrated into [Home-Assistant](https://www.home-assistant.io/) using [MQTT Discovery](https://www.home-assistant.io/docs/mqtt/discovery/).
 
```bash
WUD_TRIGGER_MQTT_MOSQUITTO_URL="mqtt://localhost:1883"
WUD_TRIGGER_MQTT_MOSQUITTO_HASS_ENABLED="true"
```

###### Check that mqtt integration is properly configured.
![image](hass_01.png)

###### A WUD device is automatically added to the hass registry
![image](hass_02.png)

###### Entities are automatically created (per Docker image)
![image](hass_03.png)

Entities are [binary_sensors](https://www.home-assistant.io/integrations/binary_sensor/) whose state is true when an update is available.

###### Entities
![image](hass_04.png)

Entities expose all the details of the container as attributes:
- Current version
- New version
- Registry
- Architecture
- OS
- Size
- ...
