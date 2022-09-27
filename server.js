//imports
const express = require('express');
const { animals } = require('./data/animals');
const PORT = process.env.PORT || 3001;

//instantiate server
const app = express();

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

//route for front-end access to animals
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});