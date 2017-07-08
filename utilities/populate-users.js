/**
* populate-users
* This file provides a method to populate the users database with a small selection of users for testing.
*
* Read ./utilities.md for usage information.
*/

// Import user data
// Credit to Thomas Matheos for writing the sample users data
const USER_DATA = require('./users.json');

function populateUsers(app) {
  const users = app.service('/users');

  // Create an array of promises to create users from data
  let userCreatePromises = [];
  for (let userDatum of USER_DATA) {
    userCreatePromises.push(users.create(userDatum));
  }

  // Use Promise.all to treat all the individual promises as one collective promise
  Promise.all(userCreatePromises)
  .then(results => {
    console.log('The following users have been created:');
    for (let result of results) {
      console.log(result);
    }
  })
  .catch(err => {
    console.log('An error occurred while creating users:');
    console.log(err);

    if (err.errorType === 'uniqueViolated') {
      console.log();
      console.log('It looks like this error was caused by attempting to create a user with a username that already exists.  To avoid this issue, try running the delete-users utility and then the populate-users utility.');
    }
  });
}

module.exports = populateUsers
