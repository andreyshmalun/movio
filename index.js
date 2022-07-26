const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  //Integrating Mongoose with a REST API
  mongoose = require('mongoose'),
  Models = require('./models.js');
require('uuid');
const app = express(),
  Movies = Models.Movie,
  Users = Models.User;


mongoose.connect(process.env.CONNECTION_URI || 'mongodb://localhost:27017/movioDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('common'));

const cors = require('cors');
app.use(cors());

require('./auth')(app);

const { check, validationResult } = require('express-validator');
const passport = require('passport');
require('./passport');


/**
 * GET welcome message from '/' endpoint
 * @name welcomeMessage
 * @kind function
 * @returns Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

const handleError = (error, res) => {
  console.error(error);
  res.status(500).send('Something went wrong: ' + error);
};


/**
 * GET a list of all movies
 * Request body: Bearer Token
 * @name getAllMovies
 * @kind function
 * @returns array of movie objects
 * @requires passport
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      handleError(error, res);
    });
});



app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((error) => {
      handleError(error, res);
    });
});


/**
 * GET data about a single movie by title
 * Request body: Bearer token
 * @name getMovie
 * @kind function
 * @param Title
 * @returns movie object
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((error) => {
      handleError(error, res);
    });
});


/**
 * GET data about a genre by genre name
 * Request body: Bearer token
 * @name getGenre
 * @kind function
 * @param genreName
 * @returns genre object
 * @requires passport
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((error) => {
      handleError(error, res);
    });
});


/**
 * GET data about a director by name
 * Request body: Bearer token
 * @name getDirector
 * @kind function
 * @param directorName
 * @returns director object
 * @requires passport
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((error) => {
      handleError(error, res);
    });
});


/**
 * POST new user. Username, password, and Email are required fields.
 * Request body: Bearer token, JSON with user information in this format:
 * {
 *  ID: Integer,
 *  Username: String,
 *  Password: String,
 *  Email: String,
 *  Birthday: Date
 * }
 * @name createUser
 * @kind function
 * @returns user object
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user); })
            .catch((error) => {
              handleError(error, res);
            });
        }
      })
      .catch((error) => {
        handleError(error, res);
      });
  });


/**
 * PUT new user info
 * Request body: Bearer token, updated user info in the following format:
 * {
 *  Username: String, (required)
 *  Password: String, (required)
 *  Email: String, (required)
 *  Birthday: Date, (required)
 * }
 * @name updateUser
 * @kind function
 * @param Username
 * @returns user object
 * @requires passport
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: Users.hashPassword(req.body.Password),
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true },
    (error, updatedUser) => {
      if (error) {
        handleError(error, res);
      } else {
        res.json(updatedUser);
      }
    }
  );
});


/**
 * POST a movie to a user's list of favorites
 * Request body: Bearer token
 * @name createFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (error, updatedUser) => {
      if (error) {
        handleError(error, res);
      } else {
        res.json(updatedUser);
      }
    }
  );
});


/**
 * DELETE a movie from a user's list of favorites
 * Request body: Bearer token
 * @name deleteFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (error, updatedUser) => {
      if (error) {
        handleError(error, res);
      } else {
        res.json(updatedUser);
      }
    }
  );
});


/**
 * DELETE a user by username
 * Request body: Bearer token
 * @name deleteUser
 * @kind function
 * @param Username
 * @returns Success message
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((error) => {
      handleError(error, res);
    });
});


/**
 * Error handler
 * @name errorHandler
 * @kind function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


/**
 * Request listener
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
