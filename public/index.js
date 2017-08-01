/**
* index.js
* This is a client-side javascript file to use for testing the server.
*/

console.log('Hello, world');
const socket = io(location.origin);
const feathersClient = feathers()
.configure(feathers.socketio(socket))
.configure(feathers.hooks())
.configure(feathers.authentication({
  header: 'x-auth-token',
  service: '/api/authentication',
  storage: window.localStorage
}));

function getService(name) {
  return feathersClient.service('/api/' + name);
}

feathersClient.authenticate({
  strategy: 'local',
  username: 'cnorris',
  password: 'password'
})
.then(response => {
  console.log('authenticated');
  getService('visitations-requests').on('created', message => {
    console.log('visitations request created');
    console.log(message);
  });
});
