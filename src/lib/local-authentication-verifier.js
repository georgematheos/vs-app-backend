/**
* local-authentication-verifier
* A custom verifier for local authentication.
*
* For info on local verification, and custom local verifiers, see
* https://docs.feathersjs.com/api/authentication/local.html.
* For info on passport verifiers, see
* http://passportjs.org/docs/configure.
*/

const Verifier = require('feathers-authentication-local').Verifier;

class LocalAuthenticationVerifier extends Verifier {
  verify(req, username, password, done) {
    // TODO: Actually use whatever verification method will eventually be used for this app.

    // For now, a temporary test solution is implemented
    // Pretend the only user is { username: "user", password: "pass" }
    // Will be a successful authentication if & only if username = "user" and password = "pass"

    if (username === "user" && password === "pass") {
      done(null, { username: 'user', password: 'pass' });
    }
    else {
      done(null, false);
    }
  }
}

// export the verifier
module.exports = LocalAuthenticationVerifier;
