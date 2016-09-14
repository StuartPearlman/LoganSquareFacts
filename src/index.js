'use strict';

var FACTS = require('./facts.js');

exports.handler = function (event, context) {
  try {
    console.log('event.session.application.applicationId=' + event.session.application.applicationId);

    if (event.session.application.applicationId !== process.env.APP_ID) {
      context.fail('Invalid Application ID');
    }

    if (event.session.new) {
      onSessionStarted({ requestId: event.request.requestId }, event.session);
    }

    if (event.request.type === 'LaunchRequest') {
      onLaunch(
        event.request,
        event.session,
        function callback(speechletResponse) {
          context.succeed(buildResponse(speechletResponse));
        }
      );
    } else if (event.request.type === 'IntentRequest') {
      onIntent(
        event.request,
        event.session,
        function callback(speechletResponse) {
          context.succeed(buildResponse(speechletResponse));
        }
      );
    } else if (event.request.type === 'SessionEndedRequest') {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail('Exception: ' + e);
  }
};

function onSessionStarted (sessionStartedRequest, session) {
  console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId + ', sessionId=' + session.sessionId);
}

function onLaunch (launchRequest, session, callback) {
  console.log('onLaunch requestId=' + launchRequest.requestId + ', sessionId=' + session.sessionId);
  getRandomFact(callback);
}

function onIntent (intentRequest, session, callback) {
  console.log('onIntent requestId=' + intentRequest.requestId + ', sessionId=' + session.sessionId);
  var intentName = intentRequest.intent && intentRequest.intent.name;

  if ('AMAZON.HelpIntent' === intentName) {
    getHelp(callback);
  } else {
    getRandomFact(callback);
  }
}

function onSessionEnded (sessionEndedRequest, session) {
  console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId + ', sessionId=' + session.sessionId);
}

// --------------- Functions that control the skill's behavior -----------------------

function getRandomFact (callback) {
  var factIndex = Math.floor(Math.random() * FACTS.length);
  var randomFact = FACTS[factIndex];
  var speechOutput = 'Here\'s one: ' + randomFact;
  var shouldEndSession = true;

  callback(
    buildSpeechletResponse(speechOutput, shouldEndSession)
  );
}

function getHelp (callback) {
  var speechOutput = 'Try saying, tell me a fact.'
  var shouldEndSession = false;

  callback(
    buildSpeechletResponse(speechOutput, shouldEndSession)
  );
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse (output, shouldEndSession) {
  return {
    outputSpeech: {
      type: 'PlainText',
      text: output
    },
    shouldEndSession: shouldEndSession
  };
}

function buildResponse (speechletResponse) {
  return {
    version: '1.0',
    response: speechletResponse
  };
}
