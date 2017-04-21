'use strict';

var mongoose = require('mongoose');
var config = require('../config');
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var Emailer = require('../lib/sendgrid-emailer'),
_ = require('underscore');

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
  agePref: String, default: '',
  sexPref: String,
  catPref: String,
  editing: Boolean, default: false,
  lastOffset: {type: Number, default: 0, min: 0, required: true},
  housePref: String, default: '',
	state: { type: String, enum: states, default: 'new' },
  tags: Array,
  pets: [Pet]
});

// Add tags to the user model, look these up to match pets
User.methods.addTags = function(tags, callback) {
  var self = this;
  _.each(tags, function(tag) {
    self.tags.push(tag);
  });
  self.tags = _.uniq(self.tags);
  if (_.contains(self.tags, 'indoors')) {
    self.housePref = 'small';
  };
  if (_.contains(self.tags, 'outdoors')) {
    self.housePref = 'large';
  };
  self.save();
  callback();
}

// Send a text message via twilio to this user
User.methods.sendMessage = function(msg, media) {
  var self = this;
  var options = {
    to: self.phone,
    from: config.twilioNumber,
    body: msg
  }
  if (media) options.mediaUrl = media;
  twilioClient.sendMessage(options, function(err, response) {
    console.log(`Twilio Message Sent: ${err}`);
  });
};

// Send a pet
User.methods.sendPet = function(pet) {
  if (pet.description) {
    var truncated = pet.description.length > 1600 ? pet.description.substring(0, 1200) + '...' : pet.description;
  } else {
    var truncated = 'Description not available from Shelter.'
  }
  var self = this,
    media = pet.media.photos['1'].x,
    message = `${pet.name}: ${truncated}. Contact Info: ${pet.contact.email}, ${pet.contact.phone}.`;
  self.sendMessage(message, media);
};

// set property to null
User.methods.editingPrefs = function(body, callback) {
  var self = this;
  self[`${body}Pref`] = null;
  self.editing = true;
  self.save();
  callback();
};

// set property 
User.methods.setPref = function(pref, setting) {
  var self = this;
  self[`${pref}`] = setting;
  console.log(pref, setting);
  self.editing = false;
  self.save();
  return `Great we have updated your preferences to find a ${setting} pet.`;
};

// Send a text message via twilio to this user
User.methods.advanceStatus = function() {
  var self = this;
  if (self.state == 'new') {
    self.state = 'customizing';
  } else {
    self.state = 'pairing';
  }
  self.save();
};

// Send a text message via twilio to this user
User.methods.regressStatus = function() {
  var self = this;
  if (self.state == 'pairing') {
    self.state = 'customizing';
  } else {
    self.state = 'new';
  }
  self.save();
};



// Send a text message via twilio to this user
User.methods.sendEmail = function() {
    Emailer.sendEmail(this);
};
module.exports = mongoose.model('User', User);
