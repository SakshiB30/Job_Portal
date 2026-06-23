# Backend Setup

The backend reads secrets from environment variables. Do not put real passwords in
`src/main/resources/application.properties`.

Required variables:

```powershell
$env:MONGO_URI="mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=<app-name>"
$env:MONGO_DATABASE="jobPortal_db"
$env:MAIL_USERNAME="<gmail-address>"
$env:MAIL_PASSWORD="<gmail-app-password>"
$env:JWT_SECRET="<at-least-64-random-characters>"
```

Then run:

```powershell
.\mvnw.cmd spring-boot:run
```

In IntelliJ IDEA, add the same variables in the run configuration's
`Environment variables` field. At minimum, set `MONGO_URI` for Atlas. If
`MONGO_URI` is not set, the backend uses local MongoDB at
`mongodb://localhost:27017/jobPortal_db`.

Rotate exposed secrets before using the app again:

1. In MongoDB Atlas, change the database user's password or create a new database user, then update `MONGO_URI`.
2. In Google Account security, revoke the exposed Gmail app password and create a new app password, then update `MAIL_PASSWORD`.
3. Replace `JWT_SECRET` with a new random value.
