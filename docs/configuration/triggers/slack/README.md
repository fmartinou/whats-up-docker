#### Slack
![logo](slack.png)

The ```slack``` trigger lets you post image update notifications to a Slack channel.

#### Variables

| Env var                                        | Description                      | Supported values | Default value |
| ---------------------------------------------- |:--------------------------------:|:----------------:|:-------------:| 
| ```WUD_TRIGGER_SLACK_{trigger_name}_TOKEN```   | The Oauth Token of the Slack app |                  |               |
| ```WUD_TRIGGER_SLACK_{trigger_name}_CHANNEL``` | The name of the channel to post  |                  |               |

!> The Slack channel must already exist on the workspace (the trigger won't automatically create it)

#### Examples

```bash
WUD_TRIGGER_SLACK_TEST_TOKEN="xoxp-743817063446-xxx",
WUD_TRIGGER_SLACK_TEST_CHANNEL="wud"
```
