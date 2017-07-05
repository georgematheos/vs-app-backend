# vs-app-backend
The backend for the visitations app being built for use at Phillips Exeter Academy.

The api for the server is explained in `api.md`.

<<<<<<< HEAD
The default config is in `config/default.json`.

The server source code is in `src`.

`src/index.js` is the base file that starts the server.

The feathers app started by `src/index.js` is created in `src/root-app.js`.  This root app puts an instance of the feathers app created in `src/api-app.js` at the URL route `/api`.  The feathers api app is where most of the server's brains are.  The root app mostly just serves the public files, and handles some middleware like CORS, compression, and security.

=======
>>>>>>> 9d6b78bc4f2d44cd1e051b7b743522d70838fcca
## client-authentication
This branch is for designing and testing code used to help make the client-side of authentication easy and somewhat automatic.
