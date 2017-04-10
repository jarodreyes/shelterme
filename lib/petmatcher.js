// Import module 
'use strict';
var _ = require('underscore');
var petfinder = require('petfinder')(process.env.PETFINDER_KEY, process.env.PETFINDER_SECRET);
 
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
    var offset = 0;
    var results = 20;
    var options = {
      animal: user.animalPref || 'dog',
      size: user.sizePref || 'XL',
      count: results,
      offset: offset + user.lastOffset,
    };
    petfinder.findPet(user.zipcode, options, function(err, pets, req) {
        console.log(pets, req);
        if (user.pets.length > 0) {
          pets = _.reject(pets, function(pet) { 
          return _.some(user.pets, function(p) {
              return p.id == pet.id;
            });
          })
        }
        if (pets.length <= 1) {
          user.lastOffset += results;
        }
        console.log(pets.length);
        resultPet = _.sample(pets);
        user.pets.push(resultPet);
        user.save();
        user.sendPet(resultPet);
        console.log(resultPet);
        return;
    });
  }
}

// var options = {
//   // animal: this.user.animalPref || 'Dog',
//   // size: this.user.sizePref,
//   // sex: this.user.sexPref,
//   count: 10
// };
// petfinder.findPet('92105', options, function(err, pets) {
//     console.log(pets);
// });


// { id: '37164366',
//     name: 'Hannah',
//     status: 'A',
//     description: 'Hannah is a 11 month old pup. She is black and tan with a longer, rich-colored coat.  She is a very sweet girl, super attached and affectionate, crate trained and housebroken.   Hannah feels that there is no way she can get close enough to you, she presses herself in for hugs.  Sheâs playful and would benefit from a young playful doggie friend who can provide guidance.  She needs slow introductions to other dogs and she can be a bit dominant.  She walks well on leash, but can be reactive in certain situations and needs a family with German Shepherd experience and the willingness to provide continue training.  Young children would likely over stimulate her and she would do  best in a home with no cats or small animals. Experience with German Shepherds is a must, as is a home environment suitable for large, active breeds.',
//     sex: 'F',
//     age: 'Young',
//     size: 'L',
//     mix: 'no',
//     animal: 'Dog',
//     shelterId: 'CA1115',
//     shelterPetId: undefined,
//     contact:
//      { email: 'marcy@socalrescue.org',
//        phone: '619-228-3570  ',
//        fax: undefined,
//        address1: 'c/o Marcy Astorino',
//        address2: '6161 El Cajon Blvd., #460',
//        city: 'San Diego',
//        state: 'CA',
//        zip: '92115' },
//     options: [ 'hasShots', 'altered', 'noCats', 'housetrained' ],
//     breeds: [ 'German Shepherd Dog' ],
//     media: { photos: { '1':
  //  { pnt: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=60&-pnt.jpg',
  //    fpm: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=95&-fpm.jpg',
  //    x: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=500&-x.jpg',
  //    pn: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=300&-pn.jpg',
  //    t: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=50&-t.jpg' },
  // '2':
  //  { pnt: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=60&-pnt.jpg',
  //    fpm: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=95&-fpm.jpg',
  //    x: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=500&-x.jpg',
  //    pn: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=300&-pn.jpg',
  //    t: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=50&-t.jpg' },
  // '3':
  //  { pnt: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=60&-pnt.jpg',
  //    fpm: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=95&-fpm.jpg',
  //    x: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=500&-x.jpg',
  //    pn: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=300&-pn.jpg',
  //    t: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=50&-t.jpg' } },

// [ { id: 'CA1115',
//     name: 'Southern California German Shepherd Rescue',
//     email: 'marcy@socalrescue.org',
//     phone: '619-228-3570  ',
//     fax: undefined,
//     address1: 'c/o Marcy Astorino',
//     address2: '6161 El Cajon Blvd., #460',
//     city: 'San Diego',
//     state: 'CA',
//     zip: '92115',
//     country: 'US',
//     longitude: '-117.0701',
//     latitude: '32.761' },
//   { id: 'CA1080',
//     name: 'Baja Animal Sanctuary',
//     email: 'bajadogs@aol.com',
//     phone: '619-948-3199 ',
//     fax: undefined,
//     address1: 'www.BajaAnimalSanctuary.org',
//     address2: undefined,
//     city: 'San Diego',
//     state: 'CA',
//     zip: '92102',
//     country: 'US',
//     longitude: '-117.1182',
//     latitude: '32.7148' },
//   { id: 'CA1482',
//     name: 'Second Chance Dog Rescue',
//     email: 'info@secondchancedogrescue.org',
//     phone: '619-721-3647 ',
//     fax: undefined,
//     address1: undefined,
//     address2: undefined,
//     city: 'San Diego',
//     state: 'CA',
//     zip: '92102',
//     country: 'US',
//     longitude: '-117.1182',
//     latitude: '32.7148' },

module.exports = petMatcher;