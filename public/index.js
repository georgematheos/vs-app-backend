const feathersRestClient = feathers()
.configure(feathers.rest(location.origin + '/api').fetch(fetch));

// Configure hooks
feathersRestClient.configure(feathers.hooks());

// Set up authentication abilities
feathersRestClient.configure(feathers.authentication({
  header: 'x-auth-token',
  storage: window.localStorage
}));

// Test request without authenticationg
console.log('Testing POST /api/auth-tester without  authentication');
feathersRestClient.service('auth-tester').create({
  message: 'This is a test'
  })
.then(response => {
  console.log('Request successful.  Response:');
  console.log(response);
})
.catch(err => {
  console.log('Request unsuccessful. Error:');
  console.log(err);
});


// Authenticate the user
feathersRestClient.authenticate({
  strategy: 'local',
  username: 'user',
  password: 'pass'
})
.then(response => {
  console.log('Successful authentication.  Response:');
  console.log(response);

  // Test request after authentication
  console.log('Testing POST /api/auth-tester after successful authentication.');

  feathersRestClient.service('auth-tester').create({
    message: 'This is a test'
    })
  .then(response => {
    console.log('Request successful.  Response:');
    console.log(response);
  })
  .catch(err => {
    console.log('Request unsuccessful. Error:');
    console.log(err);
  });
})
.catch(err => {
  console.log('ERROR DURING AUTHENTICATION:');
  console.log(err);
});
