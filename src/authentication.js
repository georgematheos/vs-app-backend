const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const local = require('feathers-authentication-local');


module.exports = function () {
  const app = this;
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local(config.local));

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    },
    after: {
      // add a user object to the result
      create: [
        hook => {
          // set the result.user field to the authenticated user
          hook.result.user = hook.params.user;

          // make sure not to send the password and _id fields
          delete hook.result.user['password'];
          delete hook.result.user['_id'];

          return hook;
        }
      ]
    }
  });
};
