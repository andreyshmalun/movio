const express = require('express'),
    morgan = require('morgan');
const app = express();


let topMovies = [
    {
        title: 'Inception',
        director: 'Christopher Nolan'
    },
    {
        title: 'Fight Club',
        director: 'David Fincher'
    },
    {
        title: 'Interstellar',
        director: 'Christopher Nolan'
    },
    {
        title: 'Parasite',
        director: 'Bong Joon Ho'
    },
    {
        title: 'The Departed',
        director: 'Martin Scorsese'
    },
    {
        title: 'The Prestige',
        director: 'Christopher Nolan'
    },
    {
        title: 'Arrival',
        director: 'Denis Villeneuve'
    },
    {
        title: 'Blade Runner 2049',
        director: 'Denis Villeneuve'
    },
    {
        title: '1917',
        director: 'Sam Mendes'
    },
    {
        title: 'Shutter Island',
        director: 'Martin Scorsese'
    }

];


app.use(express.static('public'));
app.use(morgan('common'));


//GET requests
app.get('/', (req, res) => {
    res.send('Welcome!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
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