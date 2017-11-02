////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Solace Corporation Messaging API for JavaScript
// Copyright 2010-2016 Solace Corporation. All rights reserved. //
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to use and
// copy the Software, and to permit persons to whom the Software is furnished to
// do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// UNLESS STATED ELSEWHERE BETWEEN YOU AND SOLACE CORPORATION, THE SOFTWARE IS
// PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// http://www.Solace.com
//
//                              * My Account *
//
// This sample demonstrates a very simple request/reply client that illustrates the following:
//  - Subscribing to a topic for direct messages.
//  - Sending request to a topic.
//  - Receiving reply with callbacks
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// The following line is for processing by JSLint.
/*global jQuery:true, $:true, solace:true, window:true */

var solace = solace || {};
solace.sample = solace.sample || {};

(function() {
    var OPERATION_TIMEOUT = 30000;
    var REQUEST_TIMEOUT = 5000;
    var ns = this;
    /**
     * Data members in the global scope
     */
    var mySessionProperties = null;
    var mySession = null;
    var myNickName = null;
    var requestTopic = 'solclientjs/myaccount';

    var sessionEventCb; // forward declaration
    var messageEventCb; // forward declaration

    var replyReceivedCb; // forward declaration
    var replyFailedCb; // forward declaration

    /**
     * An enumeration of My Account query type
     */
    this.QueryType = {
        profile:    "profile",
        address:    "address",
        phone:      "phone",
        email:      "email"
    };

    /**
     * Creates a message to with queryType as message's binary attachment
     * @param queryType
     * @return {solace.Message} message
     */
    this.createRequestMsg = function(queryType) {
        var msg = solace.SolclientFactory.createMessage();
        // Set the topic to requestTopic
        msg.setDestination(solace.SolclientFactory.createTopic(requestTopic));
        // Set delivery mode
        msg.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
        // Set binary attachment
        msg.setBinaryAttachment(queryType);
        return msg;
    };

    this.createReplyMessage = function(queryType) {
        var msg = solace.SolclientFactory.createMessage();
        // set reply message based on queryType
        var reply = "";
        if (queryType === ns.QueryType.profile) {
            reply += "Full Name: John Smith; Nick Name: " + myNickName + "; Job Title: IT Support";
        }
        else if (queryType === ns.QueryType.address) {
            reply += "Mailing Address: P.O. Box 25, Ottawa, ON; Home Address:";
        }
        else if (queryType === ns.QueryType.phone) {
            reply += "Work Phone: 111-111-1111; Home Phone: 111-222-2222; Cell Phone: 111-333-3333";
        }
        else if (queryType === ns.QueryType.email) {
            reply += "Email: john.smith@something.com";
        }
        msg.setBinaryAttachment(reply);
        return msg;
    };

    /**
     * Invoked when the Ok button is clicked on the login dialog. This method will trigger the creation and connect()
     * operation on the session. When successfully connected, handle_sessionConnected() is invoked
     */
    this.onLogin = function() {       
        // Disable the login, logout buttons
        ns.signal_loggingIn();
        // log to console
        var msg = "Creating Session: [ url='" + ns.utils_getUrl() + "', " +
                "user='" + ns.utils_getUserName() + ", vpn='" + ns.utils_getVPN() + "']";
        ns.utils_appendToConsole(msg);
        // create the session
        try {
            // Create Session
            mySessionProperties = new solace.SessionProperties();
            mySessionProperties.connectTimeoutInMsecs = OPERATION_TIMEOUT;
            mySessionProperties.readTimeoutInMsecs = OPERATION_TIMEOUT;
            mySessionProperties.keepAliveIntervalsLimit = 10;
            mySessionProperties.userName = ns.utils_getUserName();
            mySessionProperties.vpnName = ns.utils_getVPN();
            mySessionProperties.password = ns.utils_getPassword();
            mySessionProperties.url = ns.utils_getUrl();
            myNickName = mySessionProperties.clientName = ns.utils_getNickName();

            mySession = solace.SolclientFactory.createSession(mySessionProperties,
                    new solace.MessageRxCBInfo(function(session, message) {
                        messageEventCb(session, message);
                    }, this),
                    new solace.SessionEventCBInfo(function(session, event) {
                        sessionEventCb(session, event);
                    }, this));
            ns.utils_appendToConsole("Session was successfully created.");
            // Connect it
            mySession.connect();
        } catch (error) {
            ns.utils_appendToConsole("Could not login");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    /**
     * Invoked when the user logs out
     */
    this.onLogout = function() {
        ns.cleanup();
        ns.signal_loggedOut();
    };

    this.onProfile = function() {
        try {
            var msg = ns.createRequestMsg(ns.QueryType.profile);
            mySession.sendRequest(msg, REQUEST_TIMEOUT, function(session, message) {
                replyReceivedCb(session, message);
            }, function(session, event) {
                replyFailedCb(session, event);
            }, null);
        } catch (error) {
            ns.utils_appendToConsole("Failed to send profile request");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    this.onAddress = function() {
        try {
            var msg = ns.createRequestMsg(ns.QueryType.address);
            mySession.sendRequest(msg, REQUEST_TIMEOUT, function(session, message) {
                replyReceivedCb(session, message);
            }, function(session, event) {
                replyFailedCb(session, event);
            }, null);
        } catch (error) {
            ns.utils_appendToConsole("Failed to send address request");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    this.onPhone = function() {
        try {
            var msg = ns.createRequestMsg(ns.QueryType.phone);
            mySession.sendRequest(msg, REQUEST_TIMEOUT, function(session, message) {
                replyReceivedCb(session, message);
            }, function(session, event) {
                replyFailedCb(session, event);
            }, null);
        } catch (error) {
            ns.utils_appendToConsole("Failed to send phone request");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    this.onEmail = function() {
        try {
            var msg = ns.createRequestMsg(ns.QueryType.email);
            mySession.sendRequest(msg, REQUEST_TIMEOUT, function(session, message) {
                replyReceivedCb(session, message);
            }, function(session, event) {
                replyFailedCb(session, event);
            }, null);
        } catch (error) {
            ns.utils_appendToConsole("Failed to send email request");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    /**
     * Invoked when "Show Console" checkbox is clicked
     */
    this.onShowConsole = function() {
        ns.utils_showConsole();
    };

    /**
     * Invoked when Clear button is clicked
     */
    this.onClearConsole = function() {
        ns.utils_clearConsole();
    };

    /**
     * The session was successfully connected, the next step is to add the 'rendez-vous' topic subscription
     */
    this.handle_sessionConnected = function() {
        try {
            mySession.subscribe(solace.SolclientFactory.createTopic(requestTopic), true, this, OPERATION_TIMEOUT);
        } catch (error) {
            ns.utils_appendToConsole("Failed to add topic subscription");
            ns.utils_appendToConsole(error.toString());
            if (mySession !== null) {
                mySession.dispose();
                mySession = null;
            }
            ns.signal_loggedOut();
        }
    };

    /**
     * The subscription was successfully added, the next step is to send a 'I am logged in' message
     */
    this.handle_subscriptionOperationSucceeded = function() {
        ns.signal_loggedIn();
        ns.onProfile();
    };

    /**
     * General failure
     * @param text
     * @param updateContent
     */
    this.handle_failure = function(text, updateContent) {
        if (updateContent) {
            ns.utils_updateContent(text);
        }
        ns.utils_appendToConsole(text);
        ns.cleanup();
        ns.signal_loggedOut();
    };

    /**
     * General cleanup
     */
    this.cleanup = function() {
        if (mySession !== null) {
            mySession.dispose();
            mySession = null;
        }
    };

////////////////////// Callback functions //////////////////////////////////////////////////////////////////////////////

    /**
     * Session event callback
     * @param session
     * @param event
     */
    sessionEventCb = function (session, event) {
        if (event.sessionEventCode === solace.SessionEventCode.UP_NOTICE) {
            ns.handle_sessionConnected();
        } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_OK) {
            ns.handle_subscriptionOperationSucceeded();
        } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_ERROR) {
            ns.handle_failure("Failed to add subscription", true);
        } else if (event.sessionEventCode === solace.SessionEventCode.LOGIN_FAILURE) {
            ns.handle_failure("Failed to login to appliance:" + event.infoStr, true);
        } else if (event.sessionEventCode === solace.SessionEventCode.CONNECTING) {
            ns.utils_appendToConsole("Connecting...");
        } else if (event.sessionEventCode === solace.SessionEventCode.DISCONNECTED) {
            ns.handle_failure("Session is disconnected", false);
        } else {
            ns.handle_failure("Session failure!", false);
        }
        ns.utils_appendToConsole(event.toString());
    };

    /**
     * Direct message receive callback
     * @param session
     * @param message
     */
    messageEventCb = function (session, message) {
        try {
            var requestText = message.getBinaryAttachment();
            var replyMsg = ns.createReplyMessage(requestText);
            mySession.sendReply(message, replyMsg);
        } catch (error) {
            ns.utils_appendToConsole("Failed to send reply ");
            ns.utils_appendToConsole(error.toString());
        }
    };

    replyReceivedCb = function (session, message) {
        var text = message.getBinaryAttachment();
        var content = text.replace(/;/g, "<br>");
        ns.utils_updateContent(content);
    };

    replyFailedCb = function (session, event) {
        ns.utils_updateContent(event.infoStr);
        ns.utils_appendToConsole(event.toString()); 
    };

}.apply(solace.sample));








