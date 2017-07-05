const feathersRestClient = feathers()
.configure(feathers.rest(location.origin + '/api').fetch(fetch));

// Configure hooks
feathersRestClient.configure(feathers.hooks());

// Set up authentication abilities
feathersRestClient.configure(feathers.authentication({
  header: 'x-auth-token',
  storage: window.localStorage
}));

console.log(feathersRestClient);

// Authenticate the user
feathersRestClient.authenticate({
  strategy: 'local',
  username: 'user',
  password: 'pass'
})
.then(response => {
  console.log('SUCCESSFUL AUTHENTICATION.  RESPONSE:');
  console.log(response);
})
.catch(err => {
  console.log('ERROR DURING AUTHENTICATION:');
  console.log(err);
});
