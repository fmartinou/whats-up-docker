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
