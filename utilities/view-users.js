/**
* view-users
* This file provides a method to view the users currently in the users database.
*
* Read ./utilities.md for usage information.
*/

function viewUsers(app) {
  app.service('/users').find()
  .then(results => {
    console.log('User information retrieved:');
    console.log(results);
  })
  .catch(err => {
    console.log('An error occurred while attempting to get user information from users database:');
    console.log(err);
  })
}

module.exports = viewUsers;
