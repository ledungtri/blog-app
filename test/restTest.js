process.env.NODE_ENV = 'test';
const conn = require('../db/db');

function runRestTest(suite, tests) {
  describe(`### ${suite} REST TESTS`, function () {
    beforeEach(conn.clearDatabase);
    tests();
  });
}

module.exports = { runRestTest };

