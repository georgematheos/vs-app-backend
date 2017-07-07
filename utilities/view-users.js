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

    // notify user if not all results were retrieved and thus not all users can be displayed
    // TODO: actually solve this problem...
    if (results.total > results.data.length) {
      console.log();
      console.log('NOTE: not all users have been retrieved. The view-users utility will have to be modified to retrieve more users in order to fix this.');
    }
  })
  .catch(err => {
    console.log('An error occurred while attempting to get user information from users database:');
    console.log(err);
  })
}

module.exports = viewUsers;
