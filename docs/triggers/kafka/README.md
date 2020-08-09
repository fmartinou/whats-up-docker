## Kafka
![logo](kafka.png)

The ```kafka``` trigger lets you publish image update notifications to a Kafka topic.

### Variables

| Env var                                                        | Description                                                         | Supported values                    | Default value |
|:--------------------------------------------------------------:|:-------------------------------------------------------------------:|:-----------------------------------:|:-------------:| 
| ```WUD_TRIGGER_KAFKA_{trigger_name}_BROKERS```                 | Comma separated list of Kafka brokers                               |                                     |               |
| ```WUD_TRIGGER_KAFKA_{trigger_name}_SSL```                     | Is SSL enabled on the TLS connection                                | true, false                         | false         |
| ```WUD_TRIGGER_KAFKA_{trigger_name}_TOPIC```                   | The name of the topic to publish                                    |                                     | wud-image     |
| ```WUD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_TYPE```     | The type for authentication (required if authentication is enabled) | PLAIN, SCRAM-SHA-256, SCRAM-SHA-512 | PLAIN         |
| ```WUD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_USER```     | The name of the user (required if authentication is enabled)        |                                     |               |
| ```WUD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_PASSWORD``` | The password of the user (required if authentication is enabled)    |                                     |               |

!> The topic must already exist on the broker (the trigger won't automatically create it)

### Examples

#### Post a message to a&nbsp;[Cloud Karafka](https://www.cloudkarafka.com/) broker

```bash
    "WUD_TRIGGER_KAFKA_KARAKFA_BROKERS": "ark-01.srvs.cloudkafka.com:9094,ark-02.srvs.cloudkafka.com:9094,ark-03.srvs.cloudkafka.com:9094",
    "WUD_TRIGGER_KAFKA_KARAKFA_SSL": "true",
    "WUD_TRIGGER_KAFKA_KARAKFA_TOPIC": "my-user-id-wud-image",
    "WUD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_USER": "my-user-id",
    "WUD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_PASSWORD": "my-secret",
    "WUD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_TYPE": "SCRAM-SHA-256"
```

#### Example of published record
```javascript
{
  "trigger": "https://hub.docker.com",
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
