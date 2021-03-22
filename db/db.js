const mongoose = require('mongoose');
const async = require('async');

function connect() {
  return new Promise((resolve, reject) => {

    if (process.env.NODE_ENV === 'test') {
      const Mockgoose = require('mockgoose').Mockgoose;
      const mockgoose = new Mockgoose(mongoose);
      mockgoose.prepareStorage()
        .then(() => {
          mongoose.connect(
            process.env.DB_CONNECT,
            { useNewUrlParser: true, useUnifiedTopology: true }
          ).then((res, error) => {
            if (error) return reject(error);
            console.log("Connected to MongoDB.");
            resolve();
          })
        });
    } else {
      mongoose.connect(
        process.env.DB_CONNECT,
        { useNewUrlParser: true, useUnifiedTopology: true }
      ).then((res, error) => {
        if (error) return reject(error);
        console.log("Connected to MongoDB.");
        resolve();
      })
    }
  });
}

function clearDatabase(callback) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Attempt to clear non testing database!');
  }

  const fns = [];

  function createAsyncFn(index) {
    fns.push((done) => {
      mongoose.connection.collections[index].deleteOne(() => {
        done();
      });
    });
  }

  for (const i in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(i)) {
      createAsyncFn(i);
    }
  }

  async.parallel(fns, () => callback());
}


module.exports = { connect, clearDatabase };
