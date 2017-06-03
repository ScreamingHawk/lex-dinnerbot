'use strict';

var AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});

// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
            responseCard,
        },
    };
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message,
            responseCard,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
            responseCard,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

 // --------------- Functions that control the skill's behavior -----------------------

/**
 * Stores the dinner request for the given date.
 */
function setDinner(intentRequest, callback) {
    const when = intentRequest.currentIntent.slots.When;
    const food = intentRequest.currentIntent.slots.Food;
    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    if (when && food){
        var s3 = new AWS.S3();
        
        s3.putObject({
			Bucket: '<bucket_name>',
			Key: `dinner/dinner-${when}.txt`,
			Body: food
		}, function(err){
		    if (err){
                throw new Error(`Unable to save dinner for ${when}.`);
		    }
		    outputSessionAttributes.saved = true;
            callback(close(outputSessionAttributes, 'Fulfilled', { contentType: 'PlainText',
                content: `Okay, I have recorded your preference for ${food} on ${when}.` }));
		});
    }
}
/**
 * Returns the dinner request for the given date.
 */
function getDinner(intentRequest, callback) {
    const when = intentRequest.currentIntent.slots.When;
    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    if (when){
        var s3 = new AWS.S3();
        
        s3.getObject({
			Bucket: '<bucket_name>',
			Key: `dinner/dinner-${when}.txt`,
		}, function(err, data){
		    if (err){
                callback(close(outputSessionAttributes, 'Fulfilled', { contentType: 'PlainText',
                    content: `Looks like there's no preference for dinner on ${when}.` }));
                //throw new Error(`Unable to load dinner for ${when}.`);
                return;
		    }
		    const food = data.Body.toString();
		    outputSessionAttributes.loaded = true;
            callback(close(outputSessionAttributes, 'Fulfilled', { contentType: 'PlainText',
                content: `Looks like you are having ${food} for dinner on ${when}.` }));
		});
    }
}

 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    // console.log(JSON.stringify(intentRequest, null, 2));
    console.log(`dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}`);

    const name = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (name === 'Dinner') {
        return setDinner(intentRequest, callback);
    } else if (name === 'GetDinner'){
        return getDinner(intentRequest, callback);
    }
    throw new Error(`Intent with name ${name} not supported`);
}

// --------------- Main handler -----------------------

function loggingCallback(response, originalCallback) {
    // console.log(JSON.stringify(response, null, 2));
    originalCallback(null, response);
}

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        /*
        if (event.bot.name !== 'MakeAppointment') {
             callback('Invalid Bot Name');
        }
        */
        dispatch(event, (response) => loggingCallback(response, callback));
    } catch (err) {
        callback(err);
    }
};
