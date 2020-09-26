## Get Registries

This operation lets you get all the configured registries.

```bash
curl http://wud:3000/api/registries

[
    {
        "id":"ecr",
        "type":"ecr",
        "name":"ecr",
        "configuration":{
            "region":"eu-west-1",
            "accesskeyid":"A******************D",
            "secretaccesskey":"T**************************************D"
        }
    },
    {
        "id":"hub",
        "type":"hub",
        "name":"hub",
        "configuration":{
            "auth": "dXNlcm5hbWU6cGFzc3dvcmQ="
        }
    }
]
```

?> Need to add a new Registry?  
[Take a look at the documentation.](/registries/)
