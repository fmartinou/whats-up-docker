# Controller API
This API allows to query the state of the controllers.

?> Need to add a new Controller?  
[Take a look at the documentation.](/controllers/)

## Get all Controllers
This operation lets you get all the configured controllers.

```bash
curl http://wud:3000/api/controllers

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

## Get a Controller by id
This operation lets you get a specific controller.

```bash
curl http://wud:3000/api/controllers/docker.local

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

