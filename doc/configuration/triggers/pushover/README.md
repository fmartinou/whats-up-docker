### Pushover
![logo](pushover.png)

The ```pushover``` trigger lets you send realtime notifications to your devices (Android, iPhone...) using the [Pushover Service](https://pushover.net/).

#### Variables

| Env var                                            | Description                          | Supported values                                | Default value |
| -------------------------------------------------- |:------------------------------------:|:-----------------------------------------------:|:-------------:| 
| ```WUD_TRIGGER_PUSHOVER_{trigger_name}_TOKEN```    | The API token (required)             |                                                 |               |
| ```WUD_TRIGGER_PUSHOVER_{trigger_name}_USER```     | The User key (required)              | Coma separated list of devices (e.g. dev1,dev2) |               |
| ```WUD_TRIGGER_PUSHOVER_{trigger_name}_DEVICE```   | The Device(s) to notify (optional)   | [see here](https://pushover.net/api#priority)   |               |
| ```WUD_TRIGGER_PUSHOVER_{trigger_name}_SOUND```    | The notification sound (optional)    | [see here](https://pushover.net/api#sounds)     | pushover      |
| ```WUD_TRIGGER_PUSHOVER_{trigger_name}_PRIORITY``` | The notification priority (optional) | [see here](https://pushover.net/api#priority)   | 0             |

#### Examples

##### Configuration
###### Minimal
```bash
WUD_TRIGGER_PUSHOVER_1_TOKEN="*****************************"
WUD_TRIGGER_PUSHOVER_1_USER="******************************"
```

###### Full
```bash
WUD_TRIGGER_PUSHOVER_1_TOKEN="*****************************"
WUD_TRIGGER_PUSHOVER_1_USER="******************************"
WUD_TRIGGER_PUSHOVER_1_DEVICE="myIphone,mySamsung"
WUD_TRIGGER_PUSHOVER_1_SOUND="cosmic"
WUD_TRIGGER_PUSHOVER_1_PRIORITY="2"
```

#### How to get the User key
[Click here](https://pushover.net/settings)

The key is printed under the section `Reset User Key`.

#### How to get an API token
##### Register a new application
[Click here](https://pushover.net/apps/build)

![image](pushover_register.png)

##### Copy the API token
![image](pushover_api_token.png)
