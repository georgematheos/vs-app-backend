const users = require('./users/users.service.js');
const approvedVisitors = require('./approved-visitors/approved-visitors.service.js');
const approvedVisitorAdditionBlocks = require('./approved-visitor-addition-blocks/approved-visitor-addition-blocks.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(approvedVisitors);
  app.configure(approvedVisitorAdditionBlocks);
};
