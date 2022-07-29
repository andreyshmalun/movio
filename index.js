const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

let users = [
    {
        id: 1,
        name: 'Andrew',
        favoriteMovies: []
    },
    {
        id: 2,
        name: 'Nick',
        favoriteMovies: ["The Fountain"]
    }
];

let movies = [
    {
        "Title": "The Fountain",
        "Description": "As a modern-day scientist, Tommy is struggling with mortality, desperately searching for the medical breakthrough that will save the life of his cancer-stricken wife, Izzi.",
        "Genre": {
            "Name": "Drama",
            "Description": "In film and television, drama is a category of narrative fiction(or semi- fiction) intended to be more serious than humorous in tone."
        },
        "Director": {
            "Name": "Darren Aronofsky",
            "Bio": "Darren Aronofsky was born February 12, 1969, in Brooklyn, New York. Growing up, Darren was always artistic: he loved classic movies and, as a teenager, he even spent time doing graffiti art. After high school, Darren went to Harvard University to study film (both live-action and animation). He won several film awards after completing his senior thesis film, Supermarket Sweep, starring Sean Gillette, which went on to becoming a National Student Academy Award finalist. Aronofsky didn't make a feature film until five years later, in February 1996, where he began creating the concept for Pi (1998). After Darren's script for Pi (1998) received great reactions from friends, he began production. The film re-teamed Aronofsky with Gillette, who played the lead. This went on to further successes, such as Requiem for a Dream (2000), The Wrestler (2008) and Black Swan (2010). Most recently, he completed the films Noah (2014) and Mother! (2017).",
            "Birth": 1969.0
        }
    },

    {
        "Title": "The Princess Bride",
        "Description": "While home sick in bed, a young boy's grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies and allies in his quest to be reunited with his true love.",
        "Genre": {
            "Name": "Action",
            "Description": "Action film is a film genre in which the protagonist or protagonists are thrust into a series of events that typically include violence, extended fighting, physical feats, rescues and frantic chases. Action films tend to feature a mostly resourceful hero struggling against incredible odds, which include life-threatening situations, a dangerous villain, or a pursuit which usually concludes in victory for the hero."
        },
        "Director": {
            "Name": "Rob Reiner",
            "Bio": "When Rob graduated high school, his parents advised him to participate in Summer Theatre. Reiner got a job as an apprentice in the Bucks County Playhouse in Pennsylvania. He went to be further educated at UCLA Film School. Reiner felt he still wasn't successful even having a recurring role on one of the biggest shows in the country, All in the Family. Reiner began his directing career with the Oscar-nominated films This Is Spinal Tap, Stand By Me, and The Princess Bride.",
            "Birth": 1947.0
        }
    }
];

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('common'));

//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Users need names.');
    }
});

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user.');
    }
});

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to users ${id}'s array.`);
    } else {
        res.status(400).send('No such user.');
    }
});

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title != movieTitle);
        res.status(200).send(`${movieTitle} has been removed from users ${id}'s array.`);
    } else {
        res.status(400).send('No such user.');
    }
});

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted.`);
    } else {
        res.status(400).send('No such user.');
    }
});

//READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie.');
    }
});


app.get('/movies/genres/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre.');
    }
});


app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director.');
    }

});


//GET requests
app.get('/', (req, res) => {
    res.send('Welcome!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

//error-handling middleware function 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
//Listen for requests
app.listen(8080, () => {
    console.error('Your app is listening on port 8080.');
});