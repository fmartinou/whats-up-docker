### Watchers

Watchers are responsible for scanning Docker containers.
  
Watchers are enabled using environment variables.

```bash
WUD_WATCHER_{{watcher_name }}_{{ watcher_configuration_item }}=XXX
```

!> Multiple watchers can be configured (for example to monitor multiple Docker hosts).  
You just need to give them different names.

> [Find here the detailed documentation for the Docker watcher](/configuration/watchers/docker/).