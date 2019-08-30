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
- Value1: `https://hub.docker.com/grafana/grafana`
- Value2: `6.3.4`
- Value3: `{"registry":"https://hub.docker.com","organization":"grafana","image":"grafana","version":"6.2.5","date":"2019-06-25T18:27:08.196Z","architecture":"amd64","os":"linux","size":248501741,"isSemver":true,"result":{"newVersion":"6.3.4","newVersionDate":"2019-08-29T11:35:37.138413Z"}}`
