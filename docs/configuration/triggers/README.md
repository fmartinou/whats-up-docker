# Triggers

Triggers are responsible for performing actions when a new image version is found.
  
Triggers are enabled using environment variables.

```bash
WUD_TRIGGER_{{ trigger_type }}_{{trigger_name }}_{{ trigger_configuration_item }}=XXX
```

!> Multiple triggers of the same type can be configured (for example multiple Http webhooks).  
You just need to give them different names.

?> See the _Triggers_ subsection to discover which triggers are implemented and how to use them.

### Common trigger configuration
All implemented triggers, in addition to their specific configuration, also support the following common configuration variables.

| Env var                                                  | Required       | Description                               | Supported values                 | Default value when missing |
| -------------------------------------------------------- |:--------------:| ----------------------------------------- | -------------------------------- | -------------------------- |
| `WUD_TRIGGER_{{trigger_type}}}_{trigger_name}_THRESHOLD` | :white_circle: | The threshold to reach to run the trigger | `all`, `major`, `minor`, `patch` | `all`                      |

?> Threshold `all` means that the trigger will run regardless of the nature of the change

?> Threshold `major` means that the trigger will run only if this is a `major`, `minor` or `patch` semver change 

?> Threshold `minor` means that the trigger will run only if this is a `minor` or `patch` semver change

?> Threshold `patch` means that the trigger will run only if this is a `patch` semver change