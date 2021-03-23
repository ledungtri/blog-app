const express = require('express');
const app = express();
const db = require('./db/db');
const dotenv = require('dotenv');
const usersRoute = require('./routes/userRest');
const postsRoute = require('./routes/postRest');
dotenv.config();

db.connect()
  .then(() => {
    app.use(express.json());


    app.use("/api/users", usersRoute);
    app.use("/api/posts", postsRoute);

    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Listening in port ${port}...`);
    });
  });

module.exports = app;