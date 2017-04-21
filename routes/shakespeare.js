'use strict'

var express = require('express'),
  router = express.Router(),
  twilio = require('twilio'),
  petMatcher = require('../lib/petmatcher'),
  ImageChecker = require('../lib/image-checker'),
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

function printTags (tags) {
  var uMessage = "Okay I've analyzed your picture, I detect ";
  var smallTags = _.sample(tags, 4);
  console.log(`in printTags: ${smallTags}`)
  _.times(3, function(i) {
    uMessage += `${smallTags[i]}, `;
  });
  uMessage += `and ${smallTags[3]}. This will certainly help find the perfect pet.`;
  return uMessage;
}

var animals = ['dog', 'cat'],
  sizes = ['small', 'medium', 'large', 'xl'],
  sex = ['m', 'f'],
  ages = ['baby', 'young', 'adult', 'senior'], 
  commands = {
    'age': 'What age animal do you prefer? [Baby, Young, Adult, Senior]',
    'sex': 'Do you prefer [male] or [female]?',
    'size': 'What size animal do you want? [Small, Medium, Large, XL, Any]',
    'animal': 'What are you looking for? [Dog, Cat]',
    'house': 'Do you care if it is house trained? [Yes, No]'
  };

// If we are in the romancing state, let's parse the body
function customizeAnimal(body, user, req) {
  var media = '',
    numMedia = req.body.NumMedia,
    message = '';

  if (!user.zipcode) {
    var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(body);
    message = 'What is your zip code?'
    if (isValidZip) {
      user.zipcode = body;
      user.save();
      message = `Alright your zip code is: ${user.zipcode}! Now ${commands.animal}`;
    }
  } else if (!user.animalPref) {
    message = `${commands.animal}`;
    var answered = _.contains(animals, body);
    if (user.state == 'pairing') {
      user.regressStatus();
    }
    if (answered) {
      user.setPref('animalPref', body);
      message = user.editing ? user.setPref('animalPref', body) : `Okay, now for the fun part. Take a picture of where your adorable ${user.animalPref} will spend most of its time. Your apartment? The backyard? Wherever you live.`;
    }
  } else if (!user.agePref) {
    message = `${commands.age}`;
    var answered = _.contains(ages, body);
    if (answered) {
      message = user.editing ? user.setPref('agePref', body) : `Great! We'll find you a pet soul mate that will thrive in your living environment.`;
      user.advanceStatus();
      // Send them a pet!
      petMatcher.findPet(user);
    }
  } else if (!user.sizePref) {
    message = `${commands.size}`;
    var answered = _.contains(sizes, body);
    console.log(`Answered: ${answered} - Editing: ${user.editing}`);
    if (answered) {
      var size = body == 'xl' ? 'XL' : body[0].toUpperCase();
      message = user.setPref('sizePref', size);
    }
  }

  if (numMedia > 0) {
    var incomingMedia = req.body.MediaUrl0;
    console.log(incomingMedia);
    message = `Okay we're processing your picture, but one last question. ${commands.age}`
    ImageChecker.check(incomingMedia, function(tags) {
      if (tags.length > 0) {
        user.addTags(tags, function() {
          message = printTags(tags);
          user.sendMessage(message);
        });
      } else {
        message = 'Sorry, we were unable to process that image. Try sending a different one.';
      }
    });
  }
  console.log(`Message: ${message}`);
  return {media: media, message: message}
}

// Twilio webhook for Message url at https://www.twilio.com/console/phone-numbers/XXXXXXXXXXXXXXXXXXXXXXXXXSID
router.post('/incoming/', function (req,res,next) {
  var body = req.body.Body.toLowerCase(),
    numMedia = req.body.NumMedia,
    userPhone = req.body.From,
    message = '',
    media = '';
  res.type('text/xml');

  var query = {phone: userPhone},
    update = { expire: new Date()},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(query, update, options)
    .then(function (user) {
      // Check if user is new, or is customizing their pet.
      switch (user.state) {
        case 'new':
          user.sendMessage("Hello happy pet hunter, I'm ShelterBuddy your helpful pet finder. Tell me about yourself? What is your zipcode?", 'http://jardiohead.s3.amazonaws.com/instructions.jpg')
          user.advanceStatus();
          break;
        case 'customizing':
          var appropriateResponse = customizeAnimal(body, user, req);
          message = appropriateResponse.message;
          media = appropriateResponse.media;
          break;
        default:
          var customizing = _.has(commands, body);
          console.log(body, customizing);
          if (customizing || user.editing) {
            var appropriateResponse = {};
            user.editingPrefs(body, function() {
              appropriateResponse = customizeAnimal(body, user, req);
            });
            message = appropriateResponse.message;
            media = appropriateResponse.media;
          } else {
            var pet = petMatcher.findPet(user);
          }
          
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