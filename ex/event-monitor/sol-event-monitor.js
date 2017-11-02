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

// http://www.Solace.com
//
//                              * Event Monitor *
//
// Sample Requirements:
//  - The CLI configuration "Publish Client Event Messages" must be enabled
//    in the client's Message VPN on the appliance.
//
// This sample demonstrates an event monitor client that demonstrates the following:
//  - Subscribing to appliance event topic for Client Connect events:
//    #LOG/INFO/CLIENT/<appliance hostname>/CLIENT_CLIENT_CONNECT/>
//  - Receiving event messages with callbacks
//
// With "Publish Client Event Messages" enabled for the Message VPN,
// all client events are published as messages. By subscribing to the above
// topic, we are asking to receive all CLIENT_CLIENT_CONNECT event messages
// from the specified appliance.
//
// Event Message topics are treated as regular topics in that wildcarding can be
// used in the same manner as typical topics. For example, if you want to
// receive all Client Events, regardless of Event Level, the following topic
// could be used:
//
//      #LOG/*/CLIENT/<appliance hostname>/>
//
// This sample triggers a CLIENT_CLIENT_CONNECT event by connecting a second
// time to the appliance.
//
// The events transmitted by the appliance are known to contain raw ASCII data in
// the binary payload of the message. For transmission of Unicode characters, an
// SDT String field should be used.
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// The following line is for processing by JSLint.
/*global jQuery:true, $:true, solace:true, window:true */

var solace = solace || {};
solace.sample = solace.sample || {};

(function() {
    var OPERATION_TIMEOUT = 30000;
    var ns = this;
    /**
     * Data members in the global scope
     */
    var mySessionProperties = null;
    var mySession = null;
    var myNickName = null;

    var mySecondSession = null;

    var sessionEventCb; // forward declaration
    var messageEventCb; // forward declaration

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

    /**
     * Invoked when Connect Client button is clicked
     */
    this.onConnect = function() {
        ns.signal_secondSession_logginIn();
        var msg = "Creating Second Session: [ url='" + ns.utils_getUrl() + "', " +
                "user='" + ns.utils_getUserName() + ", vpn='" + ns.utils_getVPN() + "']";
        ns.utils_appendToConsole(msg);
        // create the session
        try {
            // Create Session
            var props = new solace.SessionProperties();
            props.connectTimeoutInMsecs = OPERATION_TIMEOUT;
            props.readTimeoutInMsecs = OPERATION_TIMEOUT;
            props.keepAliveIntervalsLimit = 10;
            props.userName = ns.utils_getUserName();
            props.vpnName = ns.utils_getVPN();
            props.password = ns.utils_getPassword();
            props.url = ns.utils_getUrl();

            mySecondSession = solace.SolclientFactory.createSession(props,
                    new solace.MessageRxCBInfo(function(session, message) {
                        // do nothing
                    }, this),
                    new solace.SessionEventCBInfo(function(session, event) {
                        if (event.sessionEventCode === solace.SessionEventCode.UP_NOTICE) {
                            ns.handle_secondSessionConnected();
                        } else if (event.sessionEventCode === solace.SessionEventCode.LOGIN_FAILURE) {
                            ns.handle_secondSessionFailure("Second session failed to login to appliance:" + event.infoStr);
                            ns.utils_appendToConsole("Second session login failure!");
                        } else if (event.sessionEventCode === solace.SessionEventCode.CONNECTING) {
                            ns.utils_appendToConsole("Second session connecting...");
                        } else if (event.sessionEventCode === solace.SessionEventCode.DISCONNECTED) {
                            ns.handle_secondSessionFailure("Second session is disconnected");
                        } else {
                            ns.handle_secondSessionFailure("Second session failure!");
                        }
                        ns.utils_appendToConsole(event.toString());
                    }, this));
            ns.utils_appendToConsole("Session was successfully created.");
            // Connect it
            mySecondSession.connect();
        } catch (error) {
            ns.utils_appendToConsole("Second session could not login");
            ns.utils_appendToConsole(error.toString());
            if (mySecondSession !== null) {
                mySecondSession.dispose();
                mySecondSession = null;
            }
            ns.signal_secondSession_loggedOut();
        }
    };

    /**
     * Invoked when Disconnect Client button is clicked
     */
    this.onDisconnect = function() {
         if (mySecondSession !== null) {
             mySecondSession.dispose();
             mySecondSession = null;
         }
        ns.signal_secondSession_loggedOut();
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
     * The session was successfully connected, the next step is to add the event topic subscription
     */
    this.handle_sessionConnected = function() {
        try {
            var hostname = mySession.getCapability(solace.CapabilityType.PEER_ROUTER_NAME).getValue();
            var topicStr = "#LOG/INFO/CLIENT/" + hostname + "/CLIENT_CLIENT_CONNECT/>";
            ns.utils_appendToConsole("Adding topic subscirption: " + topicStr);
            mySession.subscribe(solace.SolclientFactory.createTopic(topicStr), true, this, OPERATION_TIMEOUT);
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
    };

    /**
     * General failure
     * @param text
     * @param forcelog
     */
    this.handle_failure = function(text, forcelog) {
        if (forcelog) {
            ns.utils_appendToMessages(text);
        }
        ns.utils_appendToConsole(text);
        ns.cleanup();
        ns.signal_loggedOut();
    };

    /**
     * The second session was successfully connected
     */
    this.handle_secondSessionConnected = function() {
        ns.signal_secondSession_loggedIn();
    };

    /**
     * The second session failure
     * @param text
     */
    this.handle_secondSessionFailure = function(text) {
        ns.utils_appendToConsole(text);
        if (mySecondSession !== null) {
            mySecondSession.dispose();
            mySecondSession = null;
        }
        ns.signal_secondSession_loggedOut();
    };


    /**
     * General cleanup
     */
    this.cleanup = function() {
        if (mySecondSession !== null) {
            mySecondSession.dispose();
            mySecondSession = null;
        }
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
            ns.utils_appendToConsole("Failed to add subscription:  '" + event.correlationKey + "'");
        } else if (event.sessionEventCode === solace.SessionEventCode.LOGIN_FAILURE) {
            ns.handle_failure("Failed to login to appliance:" + event.infoStr, true);
            ns.utils_appendToConsole("Login Failure!");
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
     * Direct message receive callback.
     *
     * The events transmitted by the appliance are known to contain raw ASCII data in
     * the binary payload of the message. For transmission of Unicode characters, an
     * SDT String field should be used.
     *
     * @param session
     * @param message
     */
    messageEventCb = function (session, message) {
        ns.utils_appendToConsole(message);
        // chomp last byte (null-terminated string)
        var text = message.getBinaryAttachment();
        ns.utils_appendToMessages(text.substr(0, text.length-1));
    };

}.apply(solace.sample));








