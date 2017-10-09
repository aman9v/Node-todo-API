/*jshint esversion: 6 */
const expect = require('expect');
const request = require('supertest'); // changes made to expect are not needed for supertest expect.
const {ObjectID} = require('mongodb');

const {User} = require('./../models/user');
var {app} = require('./../server');
var {Todo} = require('./../models/todo'); // {name} name is exactly the same as the one exported
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
// seed data was moved to its own separate file.
beforeEach(populateTodos); // lets us run some code before any test case and only proceeds to
// the test cases once we call done()

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text}) // supertest converts the object passed to json.
      .expect(200) // check for the status code to be 200
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({text})
          .then((docs) => {
            expect(docs.length).toBe(1);
            expect(docs[0].text).toBe(text);
            done();
          })
        .catch((error) => done(error));
      });
  });
  it('should not create a todo when bad data is sent', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find()
          .then((docs) => {
            expect(docs.length).toBe(2);
            done();
          })
          .catch((error) => done(error));
      });
  });
});

describe(' GET /todos', () => {
  it('should fetch and return all the todos', (done) => {
    request(app)
      .get('/todos')
      .send()
      .expect(200, done);
      });
});

describe('GET /todos/:id' , () => {
  it('should return todo doc', (done) => {
    request(app) // supertest request
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.text).toBe(todos[0].text); // this expect is using the jest expect API
      })
      .end(done);
    });



  it('should return a 404 if todo not found', (done) => {
    var id = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${id}`)
      .expect(404, done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .send()
      .expect(404, done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a todo from the database', (done) => {
      var id = todos[0]._id.toHexString();

      request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.doc._id).toBe(id);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Todo.findByIdAndRemove(id).then((doc) => {
            expect(doc).toBeNull();
            done();
          }).catch((error) => done(error));
        });
  });

  it('should return a 404 if not found', (done) => {
    var id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404, done);
  });

  it('should return a 404 if object id is invalid', (done) => {
    request(app)
      .delete(`/todos/123abc`)
      .expect(404, done);
  });
});

describe("PATCH /todos/:id", () => {
  it('should update the todo', (done) => {
    var id = todos[0]._id.toHexString();
    var text = "New Text";

    request(app)
      .patch(`/todos/${id}`)
      .send({text, completed: true})
      .expect(200)
      .expect((result) => { // result holds the response that came back from the request
        expect(result.body.doc.text).toBe(text);
        expect(result.body.doc.completed).toBe(true);
        expect(typeof(result.body.doc.completedAt)).toEqual('number');
      }).end(done);
  });

  it('should clear completedAt when completed is false', (done) => {
    var id = todos[0]._id.toHexString();
    var text = "New Text Again";

    request(app)
      .patch(`/todos/${id}`)
      .send({completed: false, text})
      .expect(200)
      .expect((result) => {
        expect(result.body.doc.text).toBe(text);
        expect(result.body.doc.completed).toBe(false);
        expect(result.body.doc.completedAt).toBeNull();
      })
      .end(done);
  });
});
// If you are using the .end() method .expect() assertions that fail will not
// throw - they will return the assertion as an error to the .end() callback.
// In order to fail the test case, you will need to rethrow or pass err to done()
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token) // set(headername, headervalue)
      .expect(200)
      .expect((response) => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'eapp@example.com';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy(); // here the x-auth prop is accessed using bracket and not . as it contains a hyphen in between
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        });
        // .catch((error) => done(error));
      });

  });

  it('should return validation error is user in invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });
  //
  it('should not create a user if email is already in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: "new@example.com",
        password: "new123"
      })
      .expect(400)
      .end(done);
  });
});
