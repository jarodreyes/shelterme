var Clarifai = require('clarifai');
// instantiate a new Clarifai app passing in your clientId and clientSecret
var app = new Clarifai.App(
  'Zwo7bBQt3ovIsiHWOoRi_fL4Qyr2fdUEoyZC3aev',
  'EhnmR3pk0PgnBIIRtomklCt4tOvAeybsMXCBp303'
);

// predict the contents of an image by passing in a url
app.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/metro-north.jpg').then(
  function(response) {
    console.log(response);
  },
  function(err) {
    console.error(err);
  }
);