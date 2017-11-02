////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Solace Corporation Messaging API for JavaScript
// Copyright 2010-2016 Solace Corporation. All rights reserved. //
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to use
// and copy the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// UNLESS STATED ELSEWHERE BETWEEN YOU AND SOLACE CORPORATION, THE SOFTWARE
// IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
// A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// http://www.Solace.com
//
////////////////////////  User Interface ///////////////////////////////////////////////////////////////////////////////

// The following line is for processing by JSLint.
/*global jQuery:true, $:true, solace:true, window:true */

$(function() {
    // Tabs
    $('#tabs').tabs();
    // Dialog
    $('#dialog').dialog({
        autoOpen: false,
        width: 300,
        buttons: {
            "Ok": function() {
                $(this).dialog("close");
                solace.sample.onLogin();
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });
    // Dialog Link
    $('#dialog_link').click(function() {
        $('#dialog').dialog('open');
        return false;
    });
    //hover states on the static widgets
    $('#dialog_link, ul#icons li').hover(
            function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
            );
    // Button
    $("#LoginButton").button({
        text: true,
        icons: {
            primary: "ui-icon-check"
        }
    });
    $("#LogoutButton").button({
        text: true,
        icons: {
            primary: "ui-icon-closethick"
        }
    });
    $("#ProfileButton").button({
        text: true,
        icons: {
            primary: "ui-icon-person"
        }
    });
    $("#AddressButton").button({
        text: true,
        icons: {
            primary: "ui-icon-person"
        }
    });
    $("#PhoneButton").button({
        text: true,
        icons: {
            primary: "ui-icon-person"
        }
    });
    $("#EmailButton").button({
        text: true,
        width: 100,
        icons: {
            primary: "ui-icon-person"
        }
    });
    $("#ClearButton").button({
        text: true,
        width: 100,
        icons: {
            primary: "ui-icon-trash"
        }
    });

});

var solace = solace || {};
solace.sample = solace.sample || {};

(function() {
    var ns = this;

    this.utils_appendToConsole = function(message) {
        ns.utils_appendLineToTextArea("output_console", message, true);
    };

    this.utils_showConsole = function() {
        var visible = ns.utils_isChecked("input_show_console");
        ns.utils_setVisibility("output_console", visible);
        ns.utils_setVisibility("ClearButton", visible);
    };

    this.utils_clearConsole = function() {
         ns.utils_clearTextArea("output_console");
    };

    this.utils_getUrl = function() {
        return ns.utils_getField("input_session_url");
    };

    this.utils_getUserName = function() {
        return ns.utils_getField("input_session_username");
    };

    this.utils_getVPN = function() {
        return ns.utils_getField("input_session_vpn");
    };

    this.utils_getPassword = function() {
        return ns.utils_getField("input_session_password");
    };

    this.utils_getNickName = function() {
        return ns.utils_getField("input_session_nickname");
    };

    this.utils_Button_Login_setState = function(state) {
        ns.utils_control_setButtonState("LoginButton", state);
    };

    this.utils_Button_Logout_setState = function(state) {
        ns.utils_control_setButtonState("LogoutButton", state);
    };

    this.utils_Button_Profile_setState = function(state) {
        ns.utils_control_setButtonState("ProfileButton", state);
    };

    this.utils_Button_Address_setState = function(state) {
        ns.utils_control_setButtonState("AddressButton", state);
    };

    this.utils_Button_Phone_setState = function(state) {
        ns.utils_control_setButtonState("PhoneButton", state);
    };

    this.utils_Button_Email_setState = function(state) {
        ns.utils_control_setButtonState("EmailButton", state);
    };

    this.utils_updateContent = function(msg) {
        ns.utils_printHtml("content", msg);
    };

    this.signal_loggedIn = function() {
        ns.utils_Button_Login_setState(false);
        ns.utils_Button_Logout_setState(true);
        ns.utils_Button_Profile_setState(true);
        ns.utils_Button_Address_setState(true);
        ns.utils_Button_Phone_setState(true);
        ns.utils_Button_Email_setState(true);
         $('#nickname').html("My Account - " + ns.utils_getNickName() + " -");
    };

    this.signal_loggedOut = function() {
        ns.utils_updateContent("");
        ns.utils_Button_Login_setState(true);
        ns.utils_Button_Logout_setState(false);
        ns.utils_Button_Profile_setState(false);
        ns.utils_Button_Address_setState(false);
        ns.utils_Button_Phone_setState(false);
        ns.utils_Button_Email_setState(false);
        $('#nickname').html("My Account - Signed Out - ");
    };

    this.signal_loggingIn = function() {
        ns.utils_updateContent("");
        ns.utils_Button_Login_setState(false);
        ns.utils_Button_Logout_setState(false);
        ns.utils_Button_Profile_setState(false);
        ns.utils_Button_Address_setState(false);
        ns.utils_Button_Phone_setState(false);
        ns.utils_Button_Email_setState(false);
    };

}.apply(solace.sample));

/**
 * jquery initialize page function
 */
$(document).ready(function() {
    var path = document.URL;
    var prefix = '';
    var index1 = path.indexOf('//');
    var index2 = -1;
    if (index1 > 0) {
        index2 = path.indexOf('/', index1+2);
        if (index2 > 0) {
            prefix = path.substring(0, index2);
        }
    }

    var DEFAULT_APPLIANCE_URL = prefix + '/solace/smf';
    var DEFAULT_USER_NAME  = 'default';
    var DEFAULT_MSG_VPN    = 'default';
    var DEFAULT_NICKNAME   = "John";

    solace.sample.signal_loggedOut();
    solace.sample.utils_setChecked('input_show_console', false);
    solace.sample.utils_setVisibility('output_console', false);
    solace.sample.utils_setVisibility('ClearButton', false);
    solace.sample.utils_setText('output_console','');
    $('body').layout({ applyDefaultStyles: true });
    solace.sample.utils_setText('input_session_url',DEFAULT_APPLIANCE_URL);
    solace.sample.utils_setText('input_session_username',DEFAULT_USER_NAME);
    solace.sample.utils_setText('input_session_vpn',DEFAULT_MSG_VPN);
    solace.sample.utils_setText('input_session_nickname',DEFAULT_NICKNAME);
});

$(window).unload(function() {
    solace.sample.cleanup();
});


