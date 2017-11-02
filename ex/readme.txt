              SOLACE CORPORATION MESSAGING API FOR JAVASCRIPT README

INTRODUCTION
    This is the Solace Corporation Messaging API for JavaScript API (solclientjs).
    This API allows JavaScript applications to send and receive messages to a
    Solace appliance running SolOS-Topic Routing (TR).

SUPPORTED BROWSERS
    Solclientjs has been tested to work in the following Web browsers. Other
    browsers, absent from this list, might also work properly, but they have
    not been verified.

      * Google Chrome
      * Mozilla Firefox
      * Internet Explorer (8.0+)

PACKAGING
    This distribution includes:

    /docs                     API online documentation

    /ex                       API samples

    /lib                      JavaScript library files

    /lib/solclient-full.js    Un-minified solclientjs library for
                              development.

    /lib/solclient-debug.js   Un-minified solclientjs library for
                              development, with logging.

    /lib/solclient.js         Solclientjs library run through the Google
                              Closure Compiler, for distribution.

API SAMPLES
    To learn how to use the JavaScript Messaging API, simple sample
    applications are provided. The samples are located in the '/ex' directory
    of this distribution.

    SAMPLE LIST

    Messenger: This sample shows a very simple server-less chat/messenger
    client.

    DirectPubSub: This sample shows how to create a session, connect a session,
    subscribe to a topic, and publish Direct messages to a topic. The debug
	version of this sample shows how to enable API logging in index_debug.html.

    DirectRequestReply: This sample demonstrates a very simple request/reply that
    illustrates how to use the request/reply API to perform request and reply
    operations on a topic.

    Event Monitor: This sample demonstrates how to use the special event
    monitoring topic subscriptions to build an application that monitors
    appliance-generated events.

    SolCache Request: This sample shows how to create a SolCache session and how to
    request a message from a SolCache session.

    RUNNING THE SAMPLES
    To run the samples, you must configure a Solace appliance to accept
    connections from the samples. See the chapter 'Quick Start' in the API
    Developer Guide.
