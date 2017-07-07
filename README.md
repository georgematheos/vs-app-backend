# vs-app-backend
The backend for the visitations app being built for use at Phillips Exeter Academy.

The api for the server is explained in `api.md`.

The default config is in `config/default.json`.

The server source code is in `src`.

`src/index.js` is the base file that starts the server.

The feathers app started by `src/index.js` is created in `src/root-app.js`.  This root app puts an instance of the feathers app created in `src/api-app.js` at the URL route `/api`.  The feathers api app is where most of the server's brains are.  The root app mostly just serves the public files, and handles some middleware like CORS, compression, and security.

Scripts to perform utility operations for server admins can be found in the `utilities` directory.  For more information, see [`utilities/utilities.md`](utilities/utilities.md);

### Users branch
This branch is for work on the users service.  Currently, it is being used for the creation of a temporary users database interface to allow for testing.
