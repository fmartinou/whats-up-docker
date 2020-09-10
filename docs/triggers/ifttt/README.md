## Ifttt
![logo](ifttt.png)

The ```ifttt``` trigger lets you send image update notifications to Ifttt via the [Maker Webhook applet](https://ifttt.com/maker_webhooks/).

### Variables

| Env var                                      | Description     | Supported values | Default value |
| --------------- ---------------------------- |:---------------:|:----------------:|:-------------:| 
| ```WUD_TRIGGER_IFTTT_{trigger_name}_KEY```   | The Webhook key |                  |               |
| ```WUD_TRIGGER_IFTTT_{trigger_name}_EVENT``` | The event name  |                  | wud-image     |

### Ifttt ingredients
On Webhook call, Ifttt captures the following ingredients:
- eventName
- occuredAt
- value1 (the image which can be updated)
- value2 (the new version)
- value3 (the image notification JSON message)

### Examples

#### Configuration
```bash
WUD_TRIGGER_IFTTT_KEY="xxx"
```

#### Ifttt captured ingredients
- EventName: `wud-image`
- OccuredAt: `August 30, 2019 at 06:51PM`
- Value1: `https://hub.docker.com/library/mariadb`
- Value2: `10.5.4-focal`
- Value3: `{"id":"657a87c8-7926-4e97-815b-60bb9fdada2a","trigger":"https://hub.docker.com","image":"library/mariadb","version":"10.3.13","versionDate":"2019-03-12T01:01:32.052509774Z","architecture":"amd64","os":"linux","size":368482149,"isSemver":true,"result":{"newVersion":"10.5.4-focal"},"created":"2020-08-09T17:19:42.789Z","updated":"2020-08-10T11:00:01.365Z"}`
