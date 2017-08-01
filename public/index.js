/**
* index.js
* This is a client-side javascript file to use for testing the server.
*/

console.log('Hello, world');
const socket = io(location.origin);
const feathersClient = feathers().configure(feathers.socketio(socket));

function getService(name) {
  return feathersClient.service('/api/' + name);
}

getService('authentication').create({
  strategy: 'local',
  username: 'swoman',
  password: 'password'
})
.then(results => {
  console.log(results);
})
