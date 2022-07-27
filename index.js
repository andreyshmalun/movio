const express = require('express'),
    morgan = require('morgan');
const app = express();

let myLogger = ((req, res, next) => {
    console.log(req.url);
    next();
});

let requestTime = ((req, res, next) => {
    req.requestTime = Date.now();
    next();
});

app.use(myLogger);
app.use(requestTime);

app.get('/', (req, res) => {
    let responseText = 'Welcome to my app!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
});

app.get('/secreturl', (req, res) => {
    let responseText = 'This is a secret url with super top-secret content.';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
});
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});



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

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my book club!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/books', (req, res) => {
    res.json(topBooks);
});

//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});