# Store API
This API allows to query the configuration of the Store.

## Get Store configuration
This operation lets you get the state of the Store.

```bash
curl http://wud:3000/api/store

{
   "configuration":{
      "path":".store",
      "file":"wud.json"
   }
}
```
