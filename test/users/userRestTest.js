process.env.NODE_ENV = 'test';

const { runRestTest } = require('../restTest');
const expect = require('chai').expect;
const User = require('../../models/User');
const TestUser = require('./testUser');

const email = 'bill@email.com';
const password = '123123';

runRestTest("USER", () => {

  describe('### POST /regiser', function () {
    it('Registered user successfully', registerSuccessful);
    it('Bad Request when invalid email', registerInvalidEmail);
    it('Bad Request when invalid password', registerInvalidPassword);
    it('Bad Request when email exists', registerExistingEmail);
  });

  describe('### POST /login', function () {
    beforeEach((done) => {
      TestUser.register(email, password).then(() => done());
    });

    it('Logged in user successfully', loginSuccessfully);
    it('Bad Request when invalid email', loginInvalidEmail);
    it('Bad Request when invalid password', loginInvalidPassword);
  });


  describe('### DELETE /:id', function () {
    let userId = '';
    let authToken = '';

    beforeEach((done) => {
      TestUser.register(email, password)
        .then(res => {
          userId = res.body._id;
          return TestUser.login(email, password);
        })
        .then(res => {
          authToken = res.body["auth-token"];
          done();
        });
    });

    it('Delete user successfully', (done) => deleteSuccessfully(userId, authToken, done));
    it('Unauthorized when missing auth-token', (done) => deleteWithoutAuth(userId, done));
    it('Unauthorized when delete other user', (done) => deleteOtherUser(authToken, done));
  });
});

function registerSuccessful(done) {
  function checkResponse(res) {
    const body = res.body;
    expect(body).to.contain.property("_id");
    expect(body).to.not.contain.property(password);
    expect(body.email).to.equal(email);
    done();
  }

  TestUser.register(email, password)
    .expect(200)
    .then(checkResponse)
}

function registerInvalidEmail(done) {
  TestUser.register("invalidformat", password)
    .expect(400)
    .then(() => done());
}

function registerInvalidPassword(done) {
  TestUser.register(email, '1')
    .expect(400)
    .then(() => done());
}


function registerExistingEmail(done) {
  function registerSameEmail() {
    TestUser.register(email, password)
      .expect(400)
      .then(() => done());
  }

  TestUser.register(email, password)
    .then(() => registerSameEmail(email, password));
}

function loginSuccessfully(done) {
  function checkResponse(res) {
    expect(res.body).to.contain.property('auth-token');
    done();
  }

  TestUser.login(email, password)
    .expect(200)
    .then(checkResponse);
}

function loginInvalidEmail(done) {
  TestUser.login("wrong@email.com", password)
    .expect(400)
    .then(() => done());
}

function loginInvalidPassword(done) {
  TestUser.login(email, "wrong_password")
    .expect(400)
    .then(() => done())
}

function deleteSuccessfully(userId, authToken, done) {
  function checkDbDoc() {
    User.findById(userId).then(dbUser => {
      expect(dbUser).to.be.null;
      done();
    });
  }

  TestUser.remove(userId, authToken)
    .expect(200)
    .then(checkDbDoc);
}

function deleteWithoutAuth(userId, done) {
  function checkDbDoc() {
    User.findById(userId).then(dbUser => {
      expect(dbUser).to.not.be.null;
      done();
    });
  }

  TestUser.remove(userId, null)
    .expect(401)
    .then(checkDbDoc);
}

function deleteOtherUser(authToken, done) {
  let newUserId = '';

  function checkDbDoc() {
    User.findById(newUserId).then(dbUser => {
      expect(dbUser).to.not.be.null;
      done();
    });
  }

  TestUser.register("other@email.com", password)
    .then(res => {
      newUserId = res.body._id;
      TestUser.remove(newUserId, authToken)
        .expect(401)
        .then(checkDbDoc);
    });
}