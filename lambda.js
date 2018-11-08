// Amazon Stuff
var Alexa = require("alexa-sdk");
var fs = require('fs');
var articulate_commands = JSON.parse(fs.readFileSync("./commands.json"));
//var APP_ID = 'amzn1.ask.skill.2268bbcd-4188-46b4-849a-06e1a5616432';

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  //alexa.appId = APP_ID;
  //console.log(JSON.stringify(event, null, 2));
  alexa.registerHandlers(newSessionHandlers);
  alexa.execute();
};


var newSessionHandlers = {
  'LaunchRequest': function() {
    this.emit('SayHello');
  },
  'CommandIntent': function() {
    // console.log(JSON.stringify(this.handler._event, null, 2));
    // console.log(JSON.stringify(this.event.request.intent.slots.Commands.value));
    this.emit('SayCommand');
  },
  'SayHello': function() {
    this.emit(':tell', 'Hello welcome to the Articulate Voice application! Articulate is a project that integrates natural language and gesture to explore data and make visulizations!');
  },
  'SayCommand': function() {
    // console.log(articulate_commands);
    var said = this.event.request.intent.slots.Commands.value;
    var contains = false;
    for (var i = 0; i < articulate_commands.ACs.length; i++) {
      if (said == articulate_commands.ACs[i]) {
        contains = true;
        break;
      }
    }
    if (contains) {
      this.emit(':tell', 'Okay, sending ' + said + ' to Articulate');
    } else {
      this.emit(':tell', 'Okay, sending ' + said + ' to Articulate, but might not be a valid command!');
    }
  }
};
