# FAQ

## Core dumped on Raspberry PI
If at startup you face an issue looking like
```
#
# Fatal error in , line 0
# unreachable code
#
#
#
#FailureMessage Object: 0x7eace25c
```

Add the `--security-opt seccomp=unconfined` option to your docker command 
Example
```
docker run ... --security-opt seccomp=unconfined fmartinou/whats-up-docker
```

