# Watcher API
This API allows to query the state of the watchers.

?> Need to add a new Watcher?  
[Take a look at the documentation.](/watchers/)

## Get all Watchers
This operation lets you get all the configured watchers.

```bash
curl http://wud:3000/api/watchers

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

## Get a Watcher by id
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

