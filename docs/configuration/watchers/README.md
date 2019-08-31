## Watchers

Watchers are responsible for monitoring things and for finding new versions.
  
Watchers are enabled using environment variables.

```bash
WUD_WATCHER_{{ watcher_type }}_{{ watcher_name }}_{{ watcher_configuration_item}}="XXX"
```

For now, only Docker is implemented ([see the subsection](/configuration/watchers/docker))

!> Multiple watchers of the same type can be configured (for example multiple Docker hosts to watch).  
You just need to give them different names.
