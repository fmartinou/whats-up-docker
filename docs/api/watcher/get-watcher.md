## Get Watcher

This operation lets you get a specific Watcher.

```bash
curl http://wud:3000/api/watchers/docker.local

[
   {
      "id":"docker.local",
      "type":"docker",
      "name":"local",
      "configuration":{
         "socket":"/var/run/docker.sock",
         "port":2375,
         "cron":"0 * * * *",
         "watchbydefault":true
      }
   }
]
```
