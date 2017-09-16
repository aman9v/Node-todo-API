const expect = require('expect');
const request = require('supertest');

var {app} = require('./../server');
var {Todo} = require('./../models/todo'); // {name} name is exactly the same as the one exported

beforeEach((done) => {
  Todo.remove({}).then(() => done()); // removes all documents from the database.
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
        Todo.find().then((docs) => {
          expect(docs.length).toBe(5);
          expect(docs[0].text).toBe(text);
          done();
        }).catch((error) => done(err));
      });
  });
});
// If you are using the .end() method .expect() assertions that fail will not
// throw - they will return the assertion as an error to the .end() callback.
// In order to fail the test case, you will need to rethrow or pass err to done()
