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
  username: 'swoman',
  password: 'password'
})
.then(response => {
  getService('visitations').create({
    visitorUsername: "swoman",
    hostUsername: "mlisa"
  });
});

getService('visitations').on('created', message => {
  console.log('created');
  console.log(message);
});
