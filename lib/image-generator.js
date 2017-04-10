'use strict';

var Client = require('node-rest-client').Client;
var gd = require('node-gd');
var _ = require('underscore');


function getRandomString() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var random = _.sample(possible, 5).join('');
  return random;
}
 
function getRandomInt(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max));
}

var imageGenerator = {};

imageGenerator.composite = function(pet) {
  // Generate an image of the sonnet to make it easily shareable.
  sonnet = createImage(pet);
  return;
}

var createImage = function(pet) {
  var baseY = 336,
    leading = 50,
    pid = getRandomString(),
    image1 = gd.createFromJpeg(pet.media.photos[0].x),
    image2 = gd.createFromJpeg(pet.media.photos[1].x),
    image3 = gd.createFromJpeg(pet.media.photos[2].x),
    input = gd.createFromPng('./public/shelter.png'),
    path = `./public/shakes/shake${pid}.png`,
    publicUrl = `http://45.55.136.193/shakes/shake${pid}.gif`;

  console.log(image1);

  image1.copy(input, 0, leading, 0, 0, 100, 100);
  image2.copy(input, 0, 150, 0, 0, 100, 100);
  // save the destination
  input.savePng(path, 0, function(error) {
    if (error) throw error;
    input.destroy();
    // once the image actually exists on our server, 
    // // then we can send it
    // user.sendImage(publicUrl);

    // // save it to the users profile
    // user.sonnets.push({
    //   url: publicUrl,
    //   text: poemString
    // })
    // user.save();

    // // destroy it in memory
    // img.destroy();
  });
  return;
}

// var testPet = { id: '37164366',
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
//     media: { 
//       photos: [
//         { pnt: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=60&-pnt.jpg',
//            fpm: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=95&-fpm.jpg',
//            x: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=500&-x.jpg',
//            pn: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=300&-pn.jpg',
//            t: 'http://photos.petfinder.com/photos/pets/37640247/1/?bust=1489654894&width=50&-t.jpg' },
//         { pnt: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=60&-pnt.jpg',
//            fpm: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=95&-fpm.jpg',
//            x: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=500&-x.jpg',
//            pn: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=300&-pn.jpg',
//            t: 'http://photos.petfinder.com/photos/pets/37640247/2/?bust=1490428623&width=50&-t.jpg' },
//         { pnt: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=60&-pnt.jpg',
//            fpm: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=95&-fpm.jpg',
//            x: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=500&-x.jpg',
//            pn: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=300&-pn.jpg',
//            t: 'http://photos.petfinder.com/photos/pets/37640247/3/?bust=1490428623&width=50&-t.jpg' } ],
//   }};

module.exports = imageGenerator;