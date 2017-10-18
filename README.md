# auth-proxy-server
Forward authenticated requests on to a remote API which uses HTTP Basic Auth.

The server has the following endpoints:

- **POST** `/auth/register` `{ fullName, email, password }`: registers a new user.
- **POST** `/auth/log_in` `{ email, password }`: returns `{ "token", "[JWT token]" }` for previously-registered `{ email, password }` combinations.
- `/api/*` with `Authorization: JWT [JWT token]` header: passes requests onto remote API, adding the required Basic Auth credentials.

## Requirements
- docker
- docker-compose (optional, but recommended)
- mongo docker container: `docker pull mongo`

## Configuration
Two files must be added to the `config` directory:

### `proxyConfig.json`
```
{
    "target": "https://destination.url:port",
    "auth": "user:password"
}
```

### `secret.txt`
```
The contents of this file will be used to sign the JSON Web Token used for authentication
```

## Running
```
docker-compose up
```

## Debugging
```
docker-compose -f docker-compose.yml -f docker-compose-dev.yml up
```
Sample `.vscode/launch.json`:
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Attach to Docker",
            "preLaunchTask": "tsc-watch",
            "protocol": "inspector",
            "port": 9229,
            "restart": true,
            "localRoot": "${workspaceRoot}",
            "remoteRoot": "/opt/app",
            "outFiles": [
                "${workspaceRoot}/dist/**/*.js"
            ]
        }
    ]
}
```

The `tsc-watch` pre-launch task is defined in `.vscode/tasks.json`:
```
{
    "version": "0.1.0",
    "tasks": [
        {
            "taskName": "tsc-watch",
            "command": "npm",
            "args": [
                "run",
                "watch"
            ],
            "isShellCommand": true,
            "isBackground": true,
            "isBuildCommand": true,
            "problemMatcher": "$tsc-watch",
            "showOutput": "always"
        }
    ]
}
```

## Acknowledgements

The server code is based on https://www.codementor.io/olatundegaruba/5-steps-to-authenticating-node-js-with-jwt-7ahb5dmyr
