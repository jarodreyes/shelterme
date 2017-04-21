var petfinder = require('petfinder')(process.env.PETFINDER_KEY, process.env.PETFINDER_SECRET);
petfinder.getBreedList('cat', function(err, breeds) {
  console.log(breeds);
});