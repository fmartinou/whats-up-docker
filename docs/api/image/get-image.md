## Get Image

This operation lets you get an image by id.

```bash
curl http://wud:3000/api/images/657a87c8-7926-4e97-815b-60bb9fdada2a

{
      "id":"657a87c8-7926-4e97-815b-60bb9fdada2a",
      "trigger":"https://hub.docker.com",
      "organization":"library",
      "image":"mariadb",
      "version":"10.3.13",
      "versionDate":"2019-03-12T01:01:32.052509774Z",
      "architecture":"amd64",
      "os":"linux",
      "size":368482149,
      "isSemver":true,
      "result":{
         "newVersion":"10.5.4-focal",
         "newVersionDate":"2020-07-24T19:28:44.541114Z"
      },
      "created":"2020-08-09T17:19:42.789Z",
      "updated":"2020-08-10T11:00:01.365Z"
   }
```