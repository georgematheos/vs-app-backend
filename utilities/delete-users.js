/**
* delete-users
* This file provides a method to delete all users currently in the users database.
*
* Read ./utilities.md for usage information.
*/

function deleteUsers(app) {
  const users = app.service('/users');

  // first, get all user information
  users.find()
  .then(results => {
    console.log('User information successfully retrieved.');

    // then, remove each user found by ID
    for (let user of results.data) {
      users.remove(user._id, {})
      .then(val => {
        console.log('Successfully deleted user with username ' + user.username);
      })
      .catch(err => {
        console.log('An error occurred while attempting to remove the user with the username ' + user.username + ':');
        console.log(err);
      });
    }
  })
  .catch(err => {
    console.log('An error occurred while attempting to get user information from users database:');
    console.log(err);
  })
}

module.exports = deleteUsers;
