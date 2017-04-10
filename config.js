'use strict';

var config = {};

var dbConnection = function() {
  if (process.env.NODE_ENV === 'test') {
    return 'mongodb://localhost/test';
  }

  return 'mongodb://localhost/petfinder';
};

config.dbConnection = process.env.MONGOLAB_URI || process.env.MONGO_PETFINDER_URL || process.env.MONGO_PORT_27017_TCP_ADDR;

config.authToken = process.env.TWILIO_AUTH_TOKEN;
config.accountSid = process.env.TWILIO_ACCOUNT_SID;
config.twilioNumber = process.env.PETFINDER_NUMBER || '+15017124613';
// config.dbConnection = dbConnection();

module.exports = config;
