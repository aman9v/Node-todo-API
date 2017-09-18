/*jshint esversion: 6 */
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../models/todo'); // {name} name is exactly the same as the one exported

const todos = [{
  _id: new ObjectID(),
  text: "first todo",
}, {
  _id: new ObjectID(),
  text: "second todo",
  completed: true,
  completedAt: 3321
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done()); // removes all documents from the database.
}); // lets us run some code before any test case and only proceeds to
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
        expect(res.body.doc.text).toBe(todos[0].text);
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
      .expect(404,done);
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
