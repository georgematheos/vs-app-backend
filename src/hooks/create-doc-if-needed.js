/**
* create-doc-if-needed
* This hook checks is a document exists for a given query, and if it doesn't, creates one.
* If the hook user wants, they may have the hook add more fields to the documents it creates.
* The hook takes two parameters:
* queryObj -- an object specifying the format of the query to search for the existance of a document
* If this is not included or isn't a valid object, the function will  do nothing.
* The queryObj object should contan various fields (with names matching the fields to be used while querying the database).
* Each of these fields should be set to an object which is a `specifier`, as described in the file `src/lib/get-value-from-hook`,
* specifying the value for that field to be equal to
* additionalFieldsObj -- an optional field specifying additions fields and the values they should be set to when an object is created (in addition to the query object)
* This object simply uses the same format to the queryObj, with get-value-from-hook style specifiers.
*/

const errors = require('feathers-errors');
const getValueFromHook = require('../lib/get-value-from-hook');

module.exports = function (queryObj, additionalFieldsObj) { // eslint-disable-line no-unused-vars
  return function (hook) {
    if (!queryObj || typeof(queryObj) !== 'object') {
      console.log('The query object provided to the create-doc-if-needed hook either doesn\'t exist or isn\'t an object. Hook will do nothing.');
      return hook;
    }
    additionalFieldsObj = additionalFieldsObj || [];

    // set values in queryObj using value specifiers
    for (let fieldName in queryObj) {
      if (queryObj.hasOwnProperty(fieldName)) {
        queryObj[fieldName] = getValueFromHook(queryObj[fieldName], hook);
      }
    }

    // see if the queried list exists
    return hook.service.find({ query: queryObj })
    .then(results => {
      // if no list exists, create one
      if (results.total === 0) {
        // now we know that we're gonna have to use the additionalFieldsObj,
        // so get values from value specifiers for this object
        for (let fieldName in additionalFieldsObj) {
          if (additionalFieldsObj.hasOwnProperty(fieldName)) {
            additionalFieldsObj[fieldName] = getValueFromHook(additionalFieldsObj[fieldName], hook);
          }
        }

        return hook.service.create(Object.assign({}, additionalFieldsObj, queryObj))
        .then(() => hook);
      }

      return hook;
    });
  };
};
