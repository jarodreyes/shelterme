'use strict'

var express = require('express'),
  router = express.Router(),
  twilio = require('twilio'),
  petMatcher = require('../lib/petmatcher'),
  User = require('../models/user'),
  _ = require('underscore');

// Generate a nice little TwiML response for Twilio
function twimlMessage (message, media) {
  var output = new twilio.TwimlResponse();
  if (media.length > 0) {
    output.message(function() {
      this.body(message);
      this.media(media);
    });
  } else {
    output.message(function() {
      this.body(message);
    });
  }
  return output;
}

var animals = ['dog', 'cat', 'bird', 'other'],
  sizes = ['small', 'medium', 'large', 'xl', 'any'],
  sex = ['m', 'f'];

// If we are in the romancing state, let's parse the body
function customizeAnimal(body, user, req) {
  var media = '',
    message = '';

  if (!user.zipcode) {
    var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(body);
    message = 'What is your zip code?'
    if (isValidZip) {
      user.zipcode = body;
      user.save();
      message = `Alright your zip code is: ${user.zipcode}! Now what animal companion are you looking for? [Dog, Cat, Bird, Other]`
    }
  } else if (!user.animalPref) {
    message = 'What animal companion are you looking for? [Dog, Cat, Bird, Other]'
    var answered = _.contains(animals, body);
    if (answered) {
      user.animalPref = body;
      user.save();
      message = 'Got it! What size animal do you want? [Small, Medium, Large, XL, Any] '
    }
  } else if (!user.sizePref) {
    message = `What size ${user.animalPref} do you want? [Small, Medium, Large, XL, Any]`
    var answered = _.contains(sizes, body);
    if (answered && body != 'xl') {
      user.sizePref = body[0].toUpperCase();
      user.save();
      message = 'Awesome! Do you care if it is house trained? [Yes, No]'
    } else if (body == 'xl') {
      user.sizePref = 'XL';
      user.save();
    }
  } else if (!user.housetrained) {
    message = 'Do you care if it is house trained? [Yes, No]'
    if (body == 'y' || body == 'yes') {
      user.housetrained = true;
      user.state = 'pairing';
      user.save();
      var pet = petMatcher.findPet(user);
      message = "Awesome! I'll send you a match shortly. You can always tell me to 'Find another!' and I'll send you another local pet."
    } else if (body == 'n' || body == 'no') {
      user.housetrained = false;
      user.state = 'pairing';
      user.save();
      var pet = petMatcher.findPet(user);
      message = "Awesome! I'll send you a match shortly. You can always tell me to 'Find another!' and I'll send you another local pet."
    }
  }
  return {media: media, message: message}
}

// Twilio webhook for Message url at https://www.twilio.com/console/phone-numbers/XXXXXXXXXXXXXXXXXXXXXXXXXSID
router.post('/incoming/', function (req,res,next) {
  var body = req.body.Body.toLowerCase(),
    userPhone = req.body.From,
    message = '',
    media = '';
  res.type('text/xml');

  var query = {phone: userPhone},
    update = { expire: new Date() },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(query, update, options)
    .then(function (user) {
      // Check if user is new, or is requesting a sonnet.
      switch (user.state) {
        case 'new':

          message = "Hello happy pet hunter, I'm ShelterBuddy your helpful pet finder. I have a few questions. What is your zipcode?";
          user.state = 'customizing';
          user.save();
          break;
        case 'customizing':
          var appropriateResponse = customizeAnimal(body, user, req);
          message = appropriateResponse.message;
          media = appropriateResponse.media;
          break;
        default:
          var pet = petMatcher.findPet(user);
      }
      var twiml = twimlMessage(message, media);
      res.send(twiml.toString());
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send('Could not find a user with this phone number.');
    });

})
module.exports = router;