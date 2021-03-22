process.env.NODE_ENV = 'test';

const { runRestTest } = require('../restTest');
const expect = require('chai').expect;
const TestPost = require('./testPost');
const TestUser = require('../users/testUser');

const title = "This is a title";
const postBody = "This is a post body content."
const email = "bill@email.com";
const password = "123123";

const newTitle = "This is a new title";
const newPostBody = "This is a new post body content.";

runRestTest("POST", () => {
  let authToken = '';
  let userId = '';

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

  describe('### POST /', function () {
    it('Create post successfully', (done) => createPostSuccessfully(userId, authToken, done));
    it('Bad Request when missing title', (done) => createPostWihtoutTitle(authToken, done));
    it('Bad Request when missing body', (done) => createPostWithoutBody(authToken, done));
    it('Unauthorized when missing auth-token', createPostWithoutAuth);
  });

  describe('### GET /', function () {
    beforeEach((done) => {
      let reqs = [1, 2, 3, 4, 5].map(i => {
        return TestPost.create(
          `Title ${i}`,
          `Is the number ${i} even number: ${i % 2 === 0}`,
          authToken
        );
      });
      Promise.all(reqs).then(() => done());
    })

    it('Get posts successfully', getListOfPostsSuccessfully);
    it('Get post with pagination', getListOfPostsWithPagination);
    it('Search posts successfully', searchSuccessfully);
    it('Search posts with pagination', searchWithPagination);
  });

  describe('### GET /:id', function () {
    let postId = '';

    beforeEach((done) => {
      TestPost.create(title, postBody, authToken)
        .then(res => {
          postId = res.body._id;
          done();
        });
    })

    it('Get post successfully', (done) => getSuccessfully(postId, done));
    it('Bad Request when invalid id', getWithInvalidId);
  });

  describe('### PUT /:id', function () {
    let postId = '';

    beforeEach((done) => {
      TestPost.create(title, postBody, authToken)
        .then(res => {
          postId = res.body._id;
          done();
        });
    });

    it('Update post successfully', (done) => updateSuccessfully(postId, authToken, done));
    it('Bad Request when missing title', (done) => udpateWithoutTitle(postId, authToken, done));
    it('Bad Request when missing body', (done) => udpateWithoutBody(postId, authToken, done));
    it('Unauthorized when missing auth-token', (done) => udpateWithoutAuth(postId, done));
    it('Unauthorized when update other user post', (done) => udpatOtherUserPost(postId, done));
  });

  describe('### DELETE /:id', function () {
    let postId = '';

    beforeEach((done) => {
      TestPost.create(title, postBody, authToken)
        .then(res => {
          postId = res.body._id
          done()
        });
    });

    it('Remove post successfully', (done) => removeSuccessfully(postId, authToken, done));
    it('Unauthorized when missing auth-token', (done) => removeWithoutAuth(postId, done));
    it('Unauthorized when delete other user post', (done) => removeOtherUserPost(authToken, done));
  });
});

function createPostSuccessfully(userId, authToken, done) {
  function checkResponse(res) {
    const body = res.body;
    expect(body).to.contain.property('_id');
    expect(body.title).to.equal(title);
    expect(body.body).to.equal(postBody);
    expect(body.userId).to.equal(userId);
    done();
  }

  TestPost.create(title, postBody, authToken)
    .expect(200)
    .then(checkResponse)
}

function createPostWihtoutTitle(authToken, done) {
  TestPost.create(null, postBody, authToken)
    .expect(400)
    .then(() => done())
}

function createPostWithoutBody(authToken, done) {
  TestPost.create(title, null, authToken)
    .expect(400)
    .then(() => done())
}

function createPostWithoutAuth(done) {
  TestPost.create(title, postBody, null)
    .expect(401)
    .then(() => done())
}

function getListOfPostsSuccessfully(done) {
  function checkResponse(res) {
    const body = res.body;
    expect(body).to.have.lengthOf(5);

    body.forEach(post => {
      expect(post).to.contain.property('_id');
      expect(post).to.contain.property('title');
      expect(post).to.contain.property('body');
      expect(post).to.contain.property('userId');
    });

    done();
  }

  TestPost.find({}).expect(200).then(checkResponse);
}

function getListOfPostsWithPagination(done) {
  function checkResponse(res) {
    const body = res.body;
    expect(body).to.have.lengthOf(2);
    const resultTitles = body.map(post => post.title);
    expect(resultTitles).to.have.members(["Title 3", "Title 4"]);
    done();
  }

  TestPost.find({ page: 2, size: 2 })
    .expect(200)
    .then(checkResponse);
}

function searchSuccessfully(done) {
  function checkResponse(res) {
    const body = res.body;
    const resultTitles = body.map(post => post.title);
    expect(resultTitles).to.have.members(["Title 1", "Title 3", "Title 5"]);
    done();
  }

  TestPost.find({ keyword: "even number: false" }).expect(200).then(checkResponse);
}

function searchWithPagination(done) {
  function checkResponse(res) {
    const body = res.body;
    expect(body).to.have.lengthOf(1);
    expect(body[0].title).to.equal("Title 3");
    done();
  }

  TestPost.find({ keyword: "even number: false", page: 2, size: 1 }).expect(200).then(checkResponse);
}

function getSuccessfully(postId, done) {
  TestPost.get(postId)
    .expect(200)
    .then(res => {
      const body = res.body;
      expect(body._id).to.equal(postId);
      expect(body.title).to.equal(title);
      expect(body.body).to.equal(postBody);
      expect(body).to.contain.property('userId');
      done();
    });
}

function getWithInvalidId(done) {
  TestPost.get("invalidId")
    .expect(400)
    .then(() => done());
}

function updateSuccessfully(id, authToken, done) {
  TestPost.update(id, newTitle, newPostBody, authToken)
    .expect(200)
    .then(res => {
      const body = res.body;
      expect(body.title).to.equal(newTitle);
      expect(body.body).to.equal(newPostBody);
      done();
    });
}

function udpateWithoutTitle(id, authToken, done) {
  TestPost.update(id, null, newPostBody, authToken)
    .expect(400)
    .then(done());
}

function udpateWithoutBody(id, authToken, done) {
  TestPost.update(id, newTitle, null, authToken)
    .expect(400)
    .then(done());
}

function udpateWithoutAuth(id, done) {
  TestPost.update(id, newTitle, newPostBody, null)
    .expect(401)
    .then(done());
}

function udpatOtherUserPost(id, done) {
  TestUser.createAndReturnAuth("nerUser@email.com", "123123")
    .then(newUserAuth => {
      TestPost.update(id, newTitle, newPostBody, newUserAuth)
        .expect(401)
        .then(() => done());
    });
}

function removeSuccessfully(postId, authToken, done) {
  function checkPostNotExists() {
    TestPost.get(postId).expect(404).then(() => done());
  }

  TestPost.remove(postId, authToken)
    .expect(200)
    .then(checkPostNotExists);
}

function removeWithoutAuth(postId, done) {
  function checkPostStillExists() {
    TestPost.get(postId).then(res => {
      expect(res.body._id).to.equal(postId);
      done();
    });
  }

  TestPost.remove(postId, null)
    .expect(401)
    .then(checkPostStillExists);
}

function removeOtherUserPost(authToken, done) {
  const newUserEmail = 'newUser@email.com';
  const newUserPassword = '123123';
  let newUserAuth = '';
  let newUserPostId = '';

  function checkPostStillExists() {
    TestPost.get(newUserPostId).then(res => {
      expect(res.body._id).to.equal(newUserPostId);
      done();
    });
  }

  TestUser.createAndReturnAuth(newUserEmail, newUserPassword)
    .then(auth => {
      newUserAuth = auth
      return TestPost.create(title, postBody, newUserAuth);
    })
    .then(res => {
      newUserPostId = res.body._id
      return TestPost.remove(newUserPostId, authToken).expect(401)
    })
    .then(checkPostStillExists);
}