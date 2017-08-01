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
  username: 'cphilopator',
  password: 'password'
})
.then(response => {
  console.log(response.user.username + ' authenticated');

  getService('visitations').on('created', message => {
    console.log('visitations created:');
    console.log(message);
  });

  getService('visitations').on('patched', message => {
    console.log('visitations modified:');
    console.log(message);
  })
});
