'use strict';

var twilio = require('twilio'),
  profanity = require('profanity-util'),
  Clarifai = require('clarifai'),
  _ = require('underscore');


var ImageChecker = function() {};

ImageChecker.prototype.check = function(url, callback) {
  var app = new Clarifai.App(
    'Zwo7bBQt3ovIsiHWOoRi_fL4Qyr2fdUEoyZC3aev',
    'EhnmR3pk0PgnBIIRtomklCt4tOvAeybsMXCBp303'
  );
  app.models.predict(Clarifai.GENERAL_MODEL, url).then(
    function(response) {
      // do something with response
      var tagCollection = response.outputs[0].data.concepts;
      console.log(tagCollection.length);
      if (tagCollection && tagCollection.length > 0) {
        var tags = _.pluck(tagCollection, 'name');
        console.log(tags);
      } else {
        var tags = [];
      }
      return callback(tags);
    },
    function(err) {
      // there was an error
      console.log('Clarifai Error: '+err);
    }
  );
};

module.exports = new ImageChecker();
