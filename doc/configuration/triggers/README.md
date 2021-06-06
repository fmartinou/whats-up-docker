### Triggers

Triggers are responsible for performing actions when a new image version is found.
  
Triggers are enabled using environment variables.

```bash
WUD_TRIGGER_{{ trigger_type }}_{{trigger_name }}_{{ trigger_configuration_item }}=XXX
```

!> Multiple triggers of the same type can be configured (for example multiple Http webhooks).  
You just need to give them different names.

?> See the _Triggers_ subsection to discover which triggers are implemented and how to use them.
