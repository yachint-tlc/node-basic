## Node-Postgres Server with JWT

### Example `.env` file:

```shell
PORT=3000
DATABASE_URI=postgres://abc.com
JWT_SECRET=my_jwt_secret
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Heroku Deployment 

#### Create an app

```shell
heroku login
heroku create your-app-name
```

#### Set env variables

Example to set environment variables

```shell
heroku config:set DATABASE_URI=postgres://abc.com
heroku config:set PORT=3000
```

### Manual Deployment

```shell
git push heroku main
```

### Check logs

```shell
heroku logs --tail --app <app-name>
```
