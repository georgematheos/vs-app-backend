const users = require('./users/users.service.js');
const approvedVisitors = require('./approved-visitors/approved-visitors.service.js');
const approvedVisitorAdditionBlocks = require('./approved-visitor-addition-blocks/approved-visitor-addition-blocks.service.js');
const hostApprovers = require('./host-approvers/host-approvers.service.js');
const visitations = require('./visitations/visitations.service.js');
const visitationsRequests = require('./visitations-requests/visitations-requests.service.js');
const visitationsRequestBlocks = require('./visitations-request-blocks/visitations-request-blocks.service.js');
const visitationsRestrictions = require('./visitations-restrictions/visitations-restrictions.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(approvedVisitors);
  app.configure(approvedVisitorAdditionBlocks);
  app.configure(hostApprovers);
  app.configure(visitations);
  app.configure(visitationsRequests);
  app.configure(visitationsRequestBlocks);
  app.configure(visitationsRestrictions);
};
