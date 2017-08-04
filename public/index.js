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
  console.log(response.user.username + ' authenticated');

  getService('visitations').on('visitorRemoved', message => {
    console.log('SWOMAN: visitor removed');
    console.log(message);
  })
});


const socket2 = io(location.origin);
const feathersClient2 = feathers()
.configure(feathers.socketio(socket2))
.configure(feathers.hooks())
.configure(feathers.authentication({
  header: 'x-auth-token',
  service: '/api/authentication',
  storage: window.localStorage
}));

function getService2(name) {
  return feathersClient2.service('/api/' + name);
}

feathersClient2.authenticate({
  strategy: 'local',
  username: 'cnorris',
  password: 'password'
})
.then(response => {
  console.log(response.user.username + ' authenticated');

  getService2('visitations').on('visitorRemoved', message => {
    console.log('CNORRIS: visitor removed');
    console.log(message);
  })
});
