// Import module 
'use strict';
var _ = require('underscore');
var petfinder = require('petfinder')(process.env.PETFINDER_KEY, process.env.PETFINDER_SECRET);

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
 
function listPets(err, pets) {
  // for (var i = pets.length - 1; i >= 0; i--) {
  //   var pet = pets[i];
  //   console.log(pet.media.photos);
  // }
  var pet = _.sample(pets);

  // console.log(pets);
}

function availablePets(shelterId) {
  petfinder.getPetsInShelter(shelterId, {}, listPets);
}

class petMatcher {
  constructor(user) {
    this.user = user;
  }

  addShelters() {
    petfinder.findShelter(this.user.zipcode, {}, function(err, shelters) {
      // Add shelters to 
      // save it to the users profile
      _.each(shelters, function(shelter, i, list) {
        this.user.shelters.push(shelter);
      })
    });
  }

  static findPet(user) {
    var resultPet = {};
    var offset = user.lastOffset;
    var results = 20;
    console.log(`Offset: ${offset}`);
    var options = {
      animal: user.animalPref || 'dog',
      count: results,
      offset: offset,
    };

    if (user.agePref) options.age = user.agePref.capitalize();
    if (user.sizePref) options.size = user.sizePref;

    petfinder.findPet(user.zipcode, options, function(err, pets, req) {
        // if user has pets let's reject already seen ones.
        if (user.pets.length > 0) {
          pets = _.reject(pets, function(pet) { 
          return _.some(user.pets, function(p) {
              return p.id == pet.id;
            });
          })
        }

        // filter pets for non-housePref if housePref is true
        if (user.housePref == 'small') {
          pets = _.filter(pets, function(pet) {
            return _.contains(pet.options, 'housetrained');
          });
        }

        // if we only have one valid pet left, let's set the lastOffset to +20
        // in order to pull a better list.
        if (pets.length <= 2) {
          user.lastOffset += results;
        } 
        if (pets.length > 0) {
          console.log(pets.length);
          resultPet = _.sample(pets);
          user.pets.push(resultPet);
          user.save();
          user.sendPet(resultPet);
          console.log(resultPet);
        } else {
          user.sendMessage(`I'm sorry, we couldn't find a ${user.animalPref} that met your criteria. Try changing the age or size of your ideal match.`)
        }
        return;
    });
  }
}


module.exports = petMatcher;