//imports
const express = require('express');
const { animals } = require('./data/animals');
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');


//instantiate server
const app = express();

//add middleware so that server can handle post
//parse incoming string or array
app.use(express.urlencoded({ extended: true }));
//parse incoming json
app.use(express.json());
//static files
app.use(express.static('public'));

//filter range of animals that the api returns by the querry input
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    let filteredResults = animalsArray;
    //deal with personality traits differently, array of choices
    if (query.personalityTraits) {
        //save as a dedicated array, even if input is just a string
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personality]
        } else {
            personalityTraitsArray = query.personalityTraits
        }
        //for each loop
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });

    }

    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
};

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

//post to data
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    //write new json array to data file
    fs.writeFileSync(
        path.join(__dirname,'./data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
};

//validate animal post
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
};




//routes for front-end access to animals ----------------------------------------------
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
      } else {
        res.send(404);
      }
});

// route to accept user data
app.post('/api/animals', (req,res) => {
    //set id based on index of array
    req.body.id = animals.length.toString();
    //add animal to json file and animals array within function
    if(!validateAnimal(req.body)) {
        res.status(400).send('the animal is not properly formatted.')
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }

});

//route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

//route to serve animals.html
app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

//route to serve zookeeper.html
app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

//wildcard route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '.public/index.html'));
});



// listen -------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});