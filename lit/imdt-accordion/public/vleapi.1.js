/*
 * This script is provided for inclusion in HTML activities that wish to access
 * VLE features such as parameters, attachments, and server-side data.
 *
 * This is a stub. If running on the VLE, the actual version of these functions
 * will automatically be applied using a script from the server that overwrites
 * the definitions here.
 *
 * For new projects, the current version of this file is available on the VLE
 * as /mod/oucontent/api/vleapi.1.js (this file is not actually used by the VLE).
 * We will try to ensure that old versions of this file keep working.
 */

var VLE = {
    /**
     * API version of this file (integer changed only when API has
     * non-compatible change).
     */
    apiversion: 1,

    /**
     * Point version of this file. Changed for information when there is an
     * update to the file version that does not break API, such as adding a new
     * function.
     */
    pointversion: 33,

    /**
     * Marked true if sent from server.
     */
    serverversion: false,

    /**
     * Text strings used in display. You can modify these strings if you want
     * your activity to be in a foreign language.
     */
    strings : {
        label_group: 'Group',
        option_choose: 'Choose...'
    },

    /**
     * Obtains value of a named parameter or attachment. For attachments, this
     * will return the URL of the attachment. If you want to retrieve the
     * content of the attachment, use get_attachment function.
     *
     * Parameter names are restricted to these characters: [A-Za-z0-9_-.] and
     * can only be up to 20 characters long.
     *
     * Because parameters are provided in the URL to index.html, this function
     * will not work if the user has clicked a link to a different file within
     * your activity, unless you previously ensured that all parameters were
     * included in the link.
     *
     * When not running in the VLE, this code still works to retrieve parameter
     * values from the URL.
     *
     * The following special parameter names are available when running in the
     * VLE. They have short names to avoid taking up too much space in the URL.
     *
     * _c : Course id (number); not set for previews
     * _i : Document item id (text; from id= on Item; not set for previews
     *      or if document item id does not match character restriction)
     * _p : Preview id (number); only set for previews
     * _a : Activity id (text; from id= on MediaContent); note if no id is set in the tag a temp id is assigned
     * _s : Moodle session key for user (text)
     * _u : Moodle user id (number)
     * _nosave : Flag indicating if the current user is prevented from saving data (e.g. a guest) (text, y if true)
     *
     * @param name Parameter name
     * @return Value of parameter or null if not set
     */
    get_param : function(name) {
        // Check valid param name
        this.check_key(name, 'Invalid param name: ' + name);

        // Find in query
        var search = String(location.search);
        var matches = new RegExp('[?&]' + name + '=([^&]+)').exec(search);
        if (matches && matches[1]) {
            return decodeURIComponent(matches[1].replace(/\+/g, ' '));
        } else {
            return null;
        }
    },

    /**
     * Gets the content of an attachment. (If you only want to retrieve the
     * URL, use get_param function.) The attachment must be an XML or text
     * file. For XML support, the filename must end in '.xml'.
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_attachment('frog', function(text, xmldocument) { ... },
     *   function(message) {...});
     *
     * In this example the xmldocument parameter is a DOM document object
     * containing the XML file result (if any), and the text parameter is a
     * string containing the result as plain text. The error parameter
     * is a string.
     *
     * When not running in the VLE, this function may still work but should
     * be used for testing purposes only. Specifically, it only works fully
     * on Firefox (tested on Firefox 12) and while testing, the attachment must
     * be placed in the same folder as the HTML file. It doesn't work in Chrome
     * due to browser security restrictions (Chromium issue 47416) and works
     * only partially on IE9.
     *
     * @param name Attachment name
     * @param ok Function that is called if the attachment is retrieved OK.
     * @param error Function that is called if there is an error.
     */
    get_attachment : function(name, ok, error) {
        var url = this.get_param(name);
        if (!url) {
            error('Attachment not found: ' + name);
            return;
        }
        var xml = url.match(/\.xml$/);
        this.ajax_get(url, function(req) {
            ok(req.responseText, xml ? req.responseXML : null);
        }, error);
    },

    /**
     * Return array of objects that give path and url properties
     * of all files in the zipped Folder specified (pass name attribute value).
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_folder('frog', function(contents) { ... },
     *   function(message) {...});
     *
     * In this example contents would be an array with one element for every
     * file in the folder's zip file. Each element is an object containing
     * 'path' (e.g. 'frog.jpg' or 'frog/frog.jpg' if within a folder) and 'url'
     * (the url of the file, either absolute or relative to the HTML activity's index.html).
     *
     * When not running in the VLE, this function will still work but should
     * have a supporting folder.js file in a directory named after the specified folder
     * e.g. frog/frog.folder.js. The js file should return the list of folder info, as
     * specified above, in javascript to VLE.get_folder_callback.(this is a jsonp approach)
     *
     * @param string name Folder name as specified in src attribute.
     * @param object ok Function that is called if the attachment is retrieved OK.
     * @param object error Function that is called if there is an error (VLE api only).
     * @param object t value of this
     */
    get_folder : function(name, ok, error, t) {
        // Specify this for callbacks.
        if (t === undefined) {
            t = this;
        }
        VLE.get_folder_callback = function(data) {
            ok.call(t, data);
        };
        var script = document.createElement('script');
        script.async = true;
        script .src = name + '/' + name + '.folder.js';
        document.getElementsByTagName('head')[0].appendChild(script);
    },

    /**
     * Gets data that was stored on the server.
     *
     * Note that you should not normally use the last four parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You can retrieve data either for the current user (each user has
     * independent data), for all users (so that all users access the same
     * data), or for a specific group (all users accessing that group access
     * the same data). If you specify a specific group, it must be one to
     * which the current user has access. Use Boolean true for the current user,
     * false for global data, or the string 'g1234' for group id 1234.
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_server_data(true, ['frog'], function(values) { ... },
     *   function(message) { ...});
     *
     * In this example the 'values' parameter is a JavaScript object containing
     * fields with the same names as you passed (so in this case, values.frog
     * would be the value of the data named 'frog' for this user, or an empty
     * string '' if  no such data had been set). The 'message' parameter is
     * an error message string.
     *
     * When not running in the VLE, always calls the 'error' function with the
     * message set to null.
     *
     * @param userorgroup User, global, or group identifier
     * @param names Array of names
     * @param ok Function that is called if the data is retrieved OK.
     * @param error Function that is called if there is an error.
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param modname Either 'oucontent' or 'htmlactivity' (Optional; use to get data from a different activity type)
     */
    get_server_data : function(userorgroup, names, ok, error, activityid, itemid, courseid, modname) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * Gets all data that was stored on the server.
     *
     * Note that you should not normally use the last four parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You can retrieve data either for the current user (each user has
     * independent data), for all users (so that all users access the same
     * data), or for a specific group (all users accessing that group access
     * the same data). If you specify a specific group, it must be one to
     * which the current user has access. Use Boolean true for the current user,
     * false for global data, or the string 'g1234' for group id 1234.
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_all_server_data(true, function(values) { ... },
     *   function(message) { ...});
     *
     * When not running in the VLE, always calls the 'error' function with the
     * message set to null.
     *
     * @param userorgroup User, global, or group identifier
     * @param ok Function that is called if the data is retrieved OK.
     * @param error Function that is called if there is an error.
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param modname Either 'oucontent' or 'htmlactivity' (Optional; use to get data from a different activity type)
     */
    get_all_server_data : function(userorgroup, ok, error, activityid, itemid, courseid, modname) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * Stores data on the server for the current user.
     *
     * Note that you should not normally use the last three parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You can set data either for the current user (each user has
     * independent data), for all users (so that all users access the same
     * data), or for a specific group (all users accessing that group access
     * the same data). If you specify a specific group, it must be one to
     * which the current user has access. Use Boolean true for the current user,
     * false for global data, or the string 'g1234' for group id 1234.
     *
     * The value of each key-value pair is limited to 64,000 bytes (not
     * characters) but can contain any Unicode. Keys may be up to 20 characters
     * and must contain only [A-Za-z0-9_-.]. Activity IDs and item IDs have the
     * same restriction. (Item IDs are only restricted in this way when you
     * set an activity ID for an HTML activity.)
     *
     * Setting a value to empty string has the effect of deleting that value
     * from our database and saving space, so we recommend doing that when
     * appropriate.
     *
     * You must pass two functions as parameters. Here is an example which sets
     * the value of the data item 'frog' to 'Kermit':
     * VLE.set_server_data(true, {'frog' : 'Kermit'}, function() { ... },
     *   function(message) { ... });
     *
     * In this example the 'message' parameter on the second function is an
     * error message string. The first function, with no parameters, is called
     * if the update succeeds.
     *
     * When not running in the VLE, always calls the 'error' function with the
     * message set to null.
     *
     * Especially when storing data for all users, you may wish to consider
     * race conditions. For example, if you are storing a count value, you may
     * use a pattern where based on a user action, you retrieve the current
     * value (say, 4) and then set a new one (say, 5). If two users do this at
     * a similar time, you will end up setting it to 5 twice. To avoid this
     * possibility, you can use the optional previousvalues and retry
     * parameters. If you specify previousvalues, this should be the object
     * containing the old values of the data, as retrieved by get_server_data.
     * The system will only apply the update if the data is the same as this.
     * If it is different, then the retry function will be called, passing the
     * actual current server data as its single parameter.
     *
     * Here is an example where we try to set a number to 5 but only if the
     * current value is 4. If the current number is not 4 then the last
     * function will be called with an object including the 'num' field with
     * the actual value.
     * VLE.set_server_data(true, {'num' : 5}, function() { ... },
     *   function(message) { ... }, {'num' : 4}, function(actualvalues) { ... });
     *
     * @param userorgroup User, global, or group identifier
     * @param values JavaScript object containing the key/value pairs to set
     * @param ok Function that is called if the data is set OK.
     * @param error Function that is called if there is an error.
     * @param previousvalues Previous values (optional)
     * @param retry Function that is called if previous values changed (optional)
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (optional; omit to use current course)
     */
    set_server_data : function(userorgroup, values, ok, error, previousvalues, retry,
            activityid, itemid, courseid) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * Sets exported response data on the server for the current user.
     *
     * The exported data is set as arbitrary HTML which will be included if
     * the student uses the 'Export responses' option.
     *
     * If you want to clear the value (as if the user had not saved one), then
     * set html to an empty string.
     *
     * HTML should be plain HTML with no styling (no CSS and no HTML attributes
     * that control styling). It should appear completely plain. (This is because
     * it needs to work with the RTF converter.)
     *
     * Note that you should not normally use the last three parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You must pass two functions as parameters. Here is an example which sets
     * the value of the data item 'frog' to 'Kermit':
     * VLE.set_server_data(true, {'frog' : 'Kermit'}, function() { ... },
     *   function(message) { ... });
     *
     * In this example the 'message' parameter on the second function is an
     * error message string. The first function, with no parameters, is called
     * if the update succeeds.
     *
     * When not running in the VLE (e.g. in a EPUB3 document) it always calls
     * the 'error' function with the message set to null.
     *
     * @param html String containing HTML code for use if exported
     * @param ok Function that is called if the data is set OK.
     * @param error Function that is called if there is an error.
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (optional; omit to use current course)
     */
    set_exported_response : function(html, ok, error, activityid, itemid, courseid) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * Gets a list of all groups that the current user can access.
     *
     * This method will make an AJAX request the first time it is called on the
     * page.
     *
     * If it succeeds, the 'ok' function will be called with an array of
     * grouping objects with fields id, name, and groups; the groups field is
     * an array of group objects with fields id, name, and member (boolean).
     *
     * A special 'all groups' grouping has the name set to '' and id to 0.
     *
     * If there is an error in AJAX processing, the 'error' function will be
     * called with an error message string. The error message will be null if
     * this function is used offline.
     *
     * Staff (sometimes including tutors) have access to groups to which they
     * don't belong. This function will return all groups, but you can use the
     * 'member' flag if you really want to include only groups they actively
     * belong to.
     *
     * @param ok Function that is called with the array of groupings
     * @param error Function called if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_all_groups : function(ok, error, t) {
        if (t === undefined) {
            t = this;
        }
        window.setTimeout(function() { error.call(t, null); }, 0);
    },

    /**
     * Gets a list of tutor groups that the current user can access.
     *
     * This method will make an AJAX request the first time it is called on the
     * page.
     *
     * If it succeeds, the 'ok' function will be called with one parameter.
     * This is an array of group objects (representing tutor groups) with
     * fields id, name, and member (boolean).
     *
     * The array will be empty if the user cannot access any tutor groups,
     * or if there are no tutor groups on the website.
     *
     * If there is an error in AJAX processing, the 'error' function will be
     * called with an error message string. The error message will be null if
     * this function is used offline.
     *
     * Websites with multiple variants will have multiple sets of tutor groups
     * (one per variant). This function returns all groups the user can access
     * from any of these, combined into the single array.
     *
     * Staff (sometimes including tutors) have access to groups to which they
     * don't belong. This function will return all groups, but you can use the
     * 'member' flag if you really want to include only groups they actively
     * belong to.
     *
     * @param ok Function that is called with the array of groups
     * @param error Function called if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_tutor_groups : function(ok, error, t) {
        if (t === undefined) {
            t = this;
        }
        window.setTimeout(function() { error.call(t, null); }, 0);
    },

    /**
     * Gets a list of regional groups that the current user can access.
     *
     * This method will make an AJAX request the first time it is called on the
     * page.
     *
     * If it succeeds, the 'ok' function will be called with one parameter.
     * This is an array of group objects (representing regional groups) with
     * fields id, name, and member (boolean).
     *
     * The array will be empty if the user cannot access any regional groups,
     * or if there are no regional groups on the website.
     *
     * If there is an error in AJAX processing, the 'error' function will be
     * called with an error message string. The error message will be null if
     * this function is used offline.
     *
     * Websites with multiple variants will have multiple sets of regional
     * groups (one per variant). This function returns all groups the user can
     * access from any of these, combined into the single array.
     *
     * Staff (sometimes including tutors) have access to groups to which they
     * don't belong. This function will return all groups, but you can use the
     * 'member' flag if you really want to include only groups they actively
     * belong to.
     *
     * @deprecated since version 29
     * @param ok Function that is called with the array of groups
     * @param error Function called if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_regional_groups : function(ok, error, t) {
        if (t === undefined) {
            t = this;
        }
        window.setTimeout(function() { error.call(t, null); }, 0);
    },

    /**
     * Gets a list of cluster groups that the current user can access.
     *
     * This method will make an AJAX request the first time it is called on the
     * page.
     *
     * If it succeeds, the 'ok' function will be called with one parameter.
     * This is an array of group objects (representing cluster groups) with
     * fields id, name, and member (boolean).
     *
     * The array will be empty if the user cannot access any cluster groups,
     * or if there are no cluster groups on the website.
     *
     * If there is an error in AJAX processing, the 'error' function will be
     * called with an error message string. The error message will be null if
     * this function is used offline.
     *
     * Websites with multiple variants will have multiple sets of cluster
     * groups (one per variant). This function returns all groups the user can
     * access from any of these, combined into the single array.
     *
     * Staff (sometimes including tutors) have access to groups to which they
     * don't belong. This function will return all groups, but you can use the
     * 'member' flag if you really want to include only groups they actively
     * belong to.
     *
     * @param ok Function that is called with the array of groups
     * @param error Function called if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_cluster_groups : function(ok, error, t) {
        if (t === undefined) {
            t = this;
        }
        window.setTimeout(function() { error.call(t, null); }, 0);
    },

    /**
     * Returns a new <div> containing controls that can be used to select a
     * group from a list.
     *
     * The onchange function will be called when the user selects a group, or
     * if one is selected automatically. The function has two parameters;
     * first the group object that is selected, and then true (meaning the user
     * selected it manually) or false (meaning it's the first one we picked
     * for them).
     *
     * Special behaviour:
     * 1. If there are no groups, an empty div (display:none) is returned and
     *    the onchange function is called with parameter null.
     * 2. If there is only one group, an empty div (display:none) is returned
     *    and the onchange function is called with that group.
     *
     * The returned div has class="groupselector", so you can style it in CSS.
     * Please be aware that the precise HTML contents of the returned div may
     * change between VLE releases if we find bugs or make improvements..
     *
     * You can specify groups in one of three ways:
     * 1. An array of groups e.g. returned by VLE.get_tutor_groups(), or from
     *    within a grouping in VLE.get_all_groups().
     * 2. The keywords (strings) 'tutor' or 'regional' or 'cluster'.
     * 3. A string beginning with 'grouping:' and followed by a regular
     *    expression, such as 'grouping:^Tutor groups'; this will automatically
     *    include all groups from groupings where the name matches the expresison
     *
     * In all cases, this function returns immediately with a div containing the
     * control. In the latter two cases, the control will be hidden (display:none)
     * while an AJAX request takes place.
     *
     * The autoselect option, if enabled, means the system will automatically
     * pick the first group in the list (if there are more than one). When
     * false, 'Choose...' text will show and onchange will not be called until
     * the user selects something.
     *
     * The offline version of this function behaves as if the user does not
     * have any groups (calls onchange with parameter null).
     *
     * @param groups Array of groups, keyword, or grouping regex
     * @param onchange Function to call on change and initial group selection
     * @param autoselect True if autoselect is enabled, false to choose if multi
     * @param error Function to call if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     * @return HTML div containing control
     */
    make_group_chooser : function(groups, onchange, autoselect, error, t) {
        var div = document.createElement('div');
        div.style.display = 'none';
        if (t === undefined) {
            t = this;
        }
        window.setTimeout(function() { onchange.call(t, null, false); }, 0);
        return div;
    },

    /**
     * (Internal function, not recommended for other use.)
     * Makes an AJAX GET request and calls the ok function if it succeeds or the
     * error function if it fails.
     */
    ajax_get : function(url, ok, error) {
        // Get the XMLHttpRequest object. On IE we prefer the ActiveX version
        // even though it now supports the standard way too, because the ActiveX
        // one can access files if run locally.
        var req;
        if (window.ActiveXObject) {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            req = new XMLHttpRequest();
        }
        req.open('GET', url, true);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                // Status 0 is for local files (testing use only).
                if (req.status == 200 || req.status == 0) {
                    ok(req);
                } else {
                    error('Error ' + req.status + ' loading ' + url);
                }
            }
        };
        req.send(null);
    },

    /**
     * Internal use only: Various keys are restricted to a certain regular
     * expression. This checks it and throws exception if it doesn't match.
     * @param key Key to test
     * @param message Message to throw if it fails test
     */
    check_key : function(key, message) {
        if (key === null || !key.match(/^[A-Za-z0-9._-]{1,20}$/)) {
            throw message;
        }
    },

    /**
     * Obtains information about the context where this activity has been
     * embedded. The information is returned as a JavaScript object which
     * includes the following fields (more fields may be added later).
     *
     * Fields that correspond directly to CSS values:
     * - backgroundColor (of surrounding area, e.g. '#ffffff')
     * - fontSize (of main body text, e.g. '0.875em')
     * - color (of main body text, e.g. '#1a1a1a')
     * - fontFamily (of main body text, e.g. 'Arial, sans-serif')
     * - lineHeight (of main body text, e.g. '1.4')
     * - marginBottom (of paragraphs in main body text, e.g. '10px')
     *
     * Extra fields:
     * - variant (alternate text colour for certain headings or
     *   highlights, depending on selected VLE theme)
     */
    get_embed_context : function() {
        return {
            backgroundColor: '#ffffff',
            fontSize: '0.875em',
            color: '#1a1a1a',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.4',
            marginBottom: '0.5em',
            variant: '#e80074'
        };
    },

    /**
     * Reports a user accessing this experiment, for the analytics system.
     *
     * If using the analytics system, you must call this function before any
     * of the other report_ functions. This function should usually be called
     * on each page load. (The system counts a 'visit' only once per user
     * session, so repeated visit reports within the same session will be
     * safely ignored.)
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null.
     *
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     */
    report_visit : function(error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
    },

    /**
     * Reports a counted event for analytics.
     *
     * Example: In an activity about examining rock samples, you want to
     * provide information about how many rock samples the user examined. To
     * achieve this, call report_count each time the user examines a rock
     * sample.
     *
     * The short name and display name identify the event. The short name is
     * subject to the same restrictions as other identifiers (20 characters).
     * The display name can be any text up to 40 characters and will be used
     * to display to user when showing statistics. Although the display name is
     * supplied with each function call, it is actually only stored once; if
     * you change the display name, that will change the display name for all
     * previous events that used the same short name.
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null.
     *
     * @param shortname Short name of event (Optional; see above)
     * @param displayname Display name of event (Optional; see above)
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     */
    report_count : function(shortname, displayname, error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
    },

    /**
     * Starts a timer which will report a quantity of elapsed time for
     * analytics.
     *
     * Example: You want to track the total time users spend with an activity.
     * To track this, you call this function as soon as they click a 'Start
     * activity' button. You then call the returned 'stop' function whenever
     * they finish the activity.
     *
     * This function is designed only for reporting *cumulative* time, such
     * as the total time using an activity, or the total time using a particular
     * tab. At present there is no facility to report individual timed events.
     *
     * If you don't call the stop function, the system will automatically report
     * time once per minute until the page containing the activity is closed.
     *
     * The short name and display name identify the event. The short name is
     * subject to the same restrictions as other identifiers (20 characters).
     * The display name can be any text up to 40 characters and will be used
     * to display to user when showing statistics. Although the display name is
     * supplied with each function call, it is actually only stored once; if
     * you change the display name, that will change the display name for all
     * previous events that used the same short name.
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null; the returned 'stop' function
     * does nothing.
     *
     * @param shortname Short name of event (Optional; see above)
     * @param displayname Display name of event (Optional; see above)
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @return Function which you can call when the elapsed time completes
     */
    report_start_timer : function(shortname, displayname, error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
        return function() {};
    },

    /**
     * Resets caches, such as the groups cache. Should not be needed in normal
     * situations.
     */
    reset_caches : function() {
    },

    /**
     * Sends a web service request and passes the result to the given callback.
     *
     * This function is currently only available when using HTML activity
     * module. You must have configured a named web service in that module
     * (i.e. the 'service' parameter here is an identifier which maps to a
     * service URL defined in the module settings).
     *
     * The 'input' parameter should be an object containing name/value pairs.
     * The values must be either numbers or strings. Names must follow normal
     * key rules and must not start with an underline.
     *
     * If successful, the 'ok' function will be called with a single parameter
     * which is a JavaScript object that contains arbitrary data returned by
     * the service.
     *
     * If unsuccessful, the 'error' function will be called with a single
     * parameter that is an error message.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with message set to null.
     *
     * @param service Unique identifier for service within this activity
     * @param input Input data as an object with name/value pairs
     * @param ok Function called after success, with result from service
     * @param error Function called if an error occurs (Optional)
     * @param t Optional; value to use as 'this' for callback functions
     */
    send_service_request : function(service, input, ok, error, t) {
        if (typeof(error) !== undefined) {
            window.setTimeout(function() { error.call(t, null); }, 0);
        }
    },

    /**
     * Gets the URL corresponding to an olink on the course.
     *
     * If successful, the 'ok' function will be called with a single parameter
     * which is the URL.
     *
     * If unsuccessful, the 'error' function will be called with a single
     * parameter that is an error message. This can occur if there is a
     * connection problem (no network, session lost, etc.) and also if the
     * olink cannot be found.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with message set to null.
     *
     * @param targetdoc Target document name
     * @param targetptr Specific location in target document (normally blank)
     * @param ok Function called after success, with URL
     * @param error Function called if an error occurs (Optional)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_olink_url : function(targetdoc, targetptr, ok, error, courseid, t) {
        if (t === undefined) {
            t = this;
        }
        if (typeof(errror) !== undefined) {
            window.setTimeout(function() { error.call(t, null); }, 0);
        }
    },

    /**
     * Gets the list of URL corresponding to an olink on the course.
     *
     * If successful, the 'ok' function will be called with a single parameter
     * which is the list of URL.
     *
     * If unsuccessful, the 'error' function will be called with a single
     * parameter that is an error message. This can occur if there is a
     * connection problem (no network, session lost, etc.) and also if the
     * olink cannot be found.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with message set to null.
     *
     * @param targetdocs List target document name
     * @param targetptrs List specific location in target document (normally blank)
     * @param ok Function called after success, with URL
     * @param error Function called if an error occurs (Optional)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_multiple_olink_url : function(targetdocs, targetptrs, ok, error, courseid, t) {
        if (t === undefined) {
            t = this;
        }
        if (typeof(errror) !== undefined) {
            window.setTimeout(function() { error.call(t, null); }, 0);
        }
    },

    /**
     * Dynamically resizes the iframe that contains this activity so that it
     * matches its content.
     *
     * The width will not be altered - only the height will be changed. It can
     * become larger or smaller.
     *
     * If you want to use this facility you need to call this function every
     * time you do something that might affect the size of the iframe.
     */
    resize_iframe : function() {
        // Find iframe in parent window.
        var iframe = window.frameElement;
        // If we can't find it, put a message in the console and abort.
        if (!iframe) {
            if (window.console) {
                console.log('VLE.resize_iframe: Unable to find parent iframe');
            }
            return;
        }
        // Calculate body height including margins.
        var html = document.getElementsByTagName('html')[0];
        var styles = getComputedStyle(html);
        var totalHeight = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']) + html.offsetHeight;
        // Set the height.
        iframe.height = 1;
        iframe.height = Math.max(totalHeight, document.documentElement.scrollHeight);
    },

    /**
     * Automatic resize iframe when iframe size is changed.
     *
     * @param observeElement {HTMLElement} Optional; if not passed the document body will be observed
     */
    auto_resize_iframe : function(observeElement) {
        var element = observeElement ? observeElement : document.body;
        if (!element) {
            if (window.console) {
                console.log('VLE.auto_resize_iframe: Unable to find element for observing');
            }
            return;
        }
        var resizeObserver = new ResizeObserver(function() {
            setTimeout(function() {
                this.resize_iframe();
            }.bind(this), 100);
        }.bind(this));

        resizeObserver.observe(element);
        window.matchMedia('print').addEventListener('change', this.resize_iframe);
    },

    /**
     * Determine whether the current user can save data.
     *
     * If an activity features the ability to save data for the current user, this
     * function should be used to disable this behaviour for guests before the
     * activity is marked safe for guests on the VLE.
     *
     * When this returns false, get_server_data and set_server_data will work using
     * local storage, and only for the current user (you cannot save course or group
     * data).
     *
     * @return {boolean} true if the current user can save data, false otherwise.
     */
    can_save: function() {
        return this.get_param('_nosave') !== 'y';
    },

    /**
     * Get fullscreen link.
     * Will be called if webthumbnail is false or not set.
     * For use with SC and not htmlactivity.
     *
     * @returns link url or null.
     */
    get_fullscreen_link : function() {
        return document.location.href;
    },

    /**
     * Gets the server timestamp in milliseconds.
     *
     * If successful, the 'ok' function will be called with a single parameter
     * which is the server unix timestamp.
     *
     * If unsuccessful, the 'error' function will be called with a single
     * parameter that is an error message. This can occur if there is a
     * connection problem (no network, session lost, etc.).
     *
     * When not running online returns browser/device timestamp.
     *
     * @param ok Function that is called with the server timestamp
     * @param error Function called if AJAX request fails
     * @param t Optional; value to use as 'this' for callback functions
     *
     */
    get_server_time : function(ok, error, t) {
        if (t === undefined) {
            t = this;
        }
        ok.call(t, Date.now());
    },

    /**
     * Returns if the app is offline.
     *
     * @returns bool.
     */
    is_offline: function () {
        return false;
    },

    /**
     * Gets the week details corresponding to a course module on the course.
     *
     * Works out if the owning document is located in a study planner course and
     * within a week and not a special section or subpage.
     *
     * If so it returns the start and end date times of the section as seen on the planner
     * along with a true/false value of if the current time is within that range.
     *
     *  Response format:
     *  {
     *      start: 1613174400000, (server time in milliseconds - 00:00:00 on week start date)
     *      end: 1613779199000, (server time in milliseconds - 23:59:59 on week end date)
     *      startdate: '10 February 2020', (output local to user timezone, if not 00:00:00 then add time in output)
     *      enddate: '17 February 2020' (output local to user timezone, if not 23:59:59 then add time in output)
     *      current: 1, (server time now is in range)
     *      activities: (array of activities - only returned if requested); format of items:
     *      {
     *          id: 1234,
     *          name: 'my page',
     *          modname: 'page',
     *          completed: 1 (1 or 0)
     *      }
     *  }
     *
     * @param ok Function called after success, with URL
     * @param error Function called if an error occurs (Optional)
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param t Optional; value to use as 'this' for callback functions
     * @param activities Optional boolean: Set true to include activities data
     */
    get_week : function(ok, error, activityid, itemid, courseid, t, activities) {
        if (t === undefined) {
            t = this;
        }
        if (typeof (errror) !== undefined) {
            window.setTimeout(function () {
                error.call(t, null);
            }, 0);
        }
    },

    /**
     * Get all weeks data on the course.
     *
     * Response format:
     *  [{
     *      title: "Week 1",
     *      number: 1,
     *      start: 1613174400000, (server time in milliseconds - 00:00:00 on week start date)
     *      end: 1613779199000, (server time in milliseconds - 23:59:59 on week end date)
     *      startdate: '10 February 2020', (output local to user timezone, if not 00:00:00 then add time in output)
     *      enddate: '17 February 2020' (output local to user timezone, if not 23:59:59 then add time in output)
     *      current: 1|0 current date of the section is available to access in a range of time of the section.
     *      thissection: true|false the section is getting the API.
     *      activities: (array of activities - only returned if requested); format of items:
     *      {
     *          id: 1234,
     *          name: 'my page',
     *          modname: 'page',
     *          completed: 1 (1 or 0)
     *      }
     *  }]
     *
     * @param ok Function called after success, with URL
     * @param error Function called if an error occurs (Optional)
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param t Optional; value to use as 'this' for callback functions
     * @param activities Optional boolean: Set true to include activities data
     */
    get_all_weeks: function(ok, error, activityid, itemid, courseid, t, activities) {
        if (t === undefined) {
            t = this;
        }
        if (typeof (errror) !== undefined) {
            window.setTimeout(function () {
                error.call(t, null);
            }, 0);
        }
    },

    /**
     * Gets the completion details corresponding to a course module on the course.
     *
     *  Response format:
     *  {
     *      completed: 1/0, (completed flag)
     *  }
     *
     * @param ok Function called after success, with URL
     * @param error Function called if an error occurs (Optional)
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @param t Optional; value to use as 'this' for callback functions
     */
    get_completion : function(ok, error, activityid, itemid, courseid, t) {
        if (t === undefined) {
            t = this;
        }
        if (typeof (errror) !== undefined) {
            window.setTimeout(function () {
                error.call(t, null);
            }, 0);
        }
    }
};
