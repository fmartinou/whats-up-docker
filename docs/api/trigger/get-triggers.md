## Get Triggers

This operation lets you get all the configured triggers.

```bash
curl http://wud:3000/api/triggers

[
   {
      "id":"smtp.gmail",
      "type":"smtp",
      "name":"gmail",
      "configuration":{
         "host":"smtp.gmail.com",
         "port":465,
         "user":"xxx@gmail.com",
         "pass":"secret",
         "from":"admin@wud.com",
         "to":"xxx@gmail.com"
      }
   }
]
```
