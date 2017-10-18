# auth-proxy-server
Forward authenticated requests on to a remote API which uses HTTP Basic Auth.

There are two endpoints:

- **POST** `/auth/log_in` `{ email, password }`: returns `{ "token", "JWT token" }` for valid users
- `/api/*` with `Authorization: JWT [JWT token]` header: passes requests onto remote API, adding the required Basic Auth credentials.

## Requirements
- docker (+ docker compose, optionally)
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
your-secret-string
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
