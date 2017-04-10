'use strict';

var mongoose = require('mongoose');
var config = require('../config');
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var Emailer = require('../lib/sendgrid-emailer');

var Pet = new mongoose.Schema({
  id: String,
  name: String
});

var states = ['new', 'customizing', 'pairing'];

var User = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  zipcode: String,
  animalPref: String,
  sizePref: String,
  sexPref: String,
  catPref: String,
  lastOffset: Number, default: 0,
  housetrained: Boolean,
	state: { type: String, enum: states, default: 'new' },
  pets: [Pet]
});

// Send a text message via twilio to this user
User.methods.sendPet = function(pet) {
  var truncated = pet.description.length > 1600 ? pet.description.substring(0, 1200) + '...' : pet.description;
  var self = this,
    media = pet.media.photos['1'].x,
    message = `${pet.name}: ${truncated}. Contact Info: ${pet.contact.email}, ${pet.contact.phone}.`;
  twilioClient.sendMessage({
    to: self.phone,
    from: config.twilioNumber,
    mediaUrl: media,
    body: message
  }, function(err, response) {
    console.log(err);
  });
};

// Send a text message via twilio to this user
User.methods.sendEmail = function() {
    Emailer.sendEmail(this);
};
module.exports = mongoose.model('User', User);
