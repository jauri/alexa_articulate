Instructions to run a lambda server on your machine while in the EVL network.
Author: Vijayraj Mahida
Date:	7/27/17

***Be sure to change the host name in "server.js". This always depends on the host machine that this program is run in!!! To do this on the command line run “hostname” when you are on the EVL network.***

Steps to build the server:
1) install node.js

2) install all dependencies. To do this use the following commands (in command line)
	npm install express --save
	npm install https --save
	npm install fs --save
	npm install body-parser --save
	npm install aws-lambda-mock-context --save
	npm install path --save
	npm install alexa-sdk --save

3) now in command line go to your directory and run "node server.js", you may need administrative privelages to run.

Some Notes:
-I made the html page as the main communication between SAGE2 and my server.

Next Steps:
-To actually get alexa to run you have to create an Alexa developer account. this is free (go here: https://developer.amazon.com). I suggest you make a shared account between your team (so make a shared gmail account).

-Once in the developer portal you need to add some information. Read the following link to figure out how to do this: https://github.com/alexa/skill-sample-nodejs-trivia

-For mine I added the following:
Intent Schema:

{
  "intents": [
    {
      "slots": [
        {
          "name": "Commands",
          "type": "Articulate_Commands"
        }
      ],
      "intent": "CommandIntent"
    },
    {
      "intent": "DontKnowIntent"
    },
    {
      "intent": "AMAZON.StartOverIntent"
    },
    {
      "intent": "AMAZON.RepeatIntent"
    },
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.YesIntent"
    },
    {
      "intent": "AMAZON.NoIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "intent": "AMAZON.CancelIntent"
    }
  ]
}


Sample Utterances:
CommandIntent {Commands}

-In Configuration select "https:" and the address of your server/alexa (something like "https://yourmachine.evl.uic.edu/alexa").

-In SSL Certificate choose " My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority"

-Now use the test interface to see if you get a response!


