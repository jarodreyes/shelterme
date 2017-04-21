var Clarifai = require('clarifai');
var app = new Clarifai.App(
  'Zwo7bBQt3ovIsiHWOoRi_fL4Qyr2fdUEoyZC3aev',
  'EhnmR3pk0PgnBIIRtomklCt4tOvAeybsMXCBp303'
);
// var url = 'http://www.estreetassembly.com/uploads/bby-windale-marlborough-ma.jpg';
// var url = 'http://oldweb.housing.gatech.edu/reshalls/images/195CStudy.jpg';
var url = 'https://progressivehomemaker.files.wordpress.com/2012/01/nw-corner-of-backyard-1999.jpg';
app.models.predict(Clarifai.GENERAL_MODEL, url).then(
  function(response) {
    // do something with response
    var tags = response.outputs[0].data.concepts;
    console.log();

  },
  function(err) {
    // there was an error
    console.log(err);
  }
);