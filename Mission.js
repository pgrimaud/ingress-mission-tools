/* Mission.js       -- provides useful functions to export an Ingress mission.
 *
 * Todo:
 *  * include style for lines and markers.
 *  * remove trailing whitespaces around text nodes.
 *
 * Available functions:
 *  Mission.ToKML           -- exports markers and paths to a KML file.
 *  Mission.createMarker    -- creates a marker with a given name and location.
 *  Mission.createpath      -- creates a path from its points' coordinates.
 *
 * Sample:
    var data = ['2.3568517,48.8313871' , '2.3561114,48.8322063' , '2.3543465,48.8312035' , '2.3555481,48.8308398'];
    var path = Mission.CreatePath('Italie 2', '', data);
    var begin = Mission.CreateMarker('Italie 2 (départ)', 'START', data[0]);
    var end = Mission.CreateMarker('Italie 2 (arrivé)', 'END', data[data.length-1]);
    Mission.ToKML([path, begin, end]);
 */


/*jslint vars: true, plusplus: true, nomen: true, browser: true */
/*global Mission: true */
Mission = window.Mission || {};

// Creates a KML file from markers and paths.
// The 'content' is an array of markers and path elements.
// They can be obtained using the 'CreateMarker' and 'CreatePath' functions.
Mission.ToKML = function (content) {
    'use strict';
    var xml = Mission._AppendNewNode(null, 'KML', 'xmlns', 'http://www.opengis.net/kml/2.2');
    var doc = Mission._AppendNewNode(xml, 'Document');
    var folder = Mission._AppendNewNode(doc, 'Folder');
    var k;
    for (k = 0; k < content.length; k++) {
        folder.appendChild(content[k]);
    }
    // folder.appendChild(Mission.CreateMarker('Place d\'Italie (départ)', 'START', '2.35685,48.83139'));
    var xmlstr = '<?xml version="1.0" encoding="UTF-8"?>\n' + Mission._NodeToXML(xml);
    window.open('data:text/xml;charset=utf-8,' + window.encodeURIComponent(xmlstr));
};

// Creates a DOM element for a marker.
// The data is a string of the form 'xx.xxx,yy.yyy'.
// The marker type can be either 'start', 'end', or 'any'.
Mission.CreateMarker = function (name, type, data) {
    'use strict';
    var typeStyle = {
        'start': '#icon-start-highlight',
        'end':   '#icon-end-highlight',
        'any':   '#icon-any-highlight'
    };
    var style = typeStyle[type.toLowerCase()];
    if (!style) {
        throw new Error('Invalid marker type');
    }
    var node = Mission._AppendNewNode(null, 'Placemark');
    Mission._AppendNewNode(node, 'styleUrl', '__text__', style);
    Mission._AppendNewNode(node, 'name', '__text__', name);
    var point = Mission._AppendNewNode(node, 'Point');
    Mission._AppendNewNode(point, 'coordinates', '__text__', data + ',0.0');
    return node;
};

// Creates a DOM element for a path.
// The data is an array of string of the form 'xx.xxx,yy.yyy'.
Mission.CreatePath = function (name, description, data) {
    'use strict';
    var node = Mission._AppendNewNode(null, 'Placemark');
    Mission._AppendNewNode(node, 'styleUrl', '__text__', '#line-highlight-1');
    Mission._AppendNewNode(node, 'name', '__text__', name);
    if (description) {
        Mission._AppendNewNode(node, 'description', '__text__', description);
    }
    var datastr = data.join(',0.0 ') + ',0.0';
    var line = Mission._AppendNewNode(node, 'LineString');
    Mission._AppendNewNode(line, 'coordinates', '__text__', datastr);
    return node;
};

// Creates, appends, and returns a DOM element.
// Optional arguments: attribute's name/value.
// Attribute name may be '__text__' to add a text node inside the new element.
Mission._AppendNewNode = function (parent, nodeType) {
    'use strict';
    var argc = 2;  // number of declared arguments
    if ((arguments.length - argc) % 2) {
        throw new Error('Invalid number of optional arguments');
    }
    var node = document.createElement(nodeType);
    while (argc < arguments.length) {
        if (arguments[argc] === '__text__') {
            ++argc;  // skip '__text__'
            node.appendChild(document.createTextNode(arguments[argc++]));
        } else if (arguments[argc][0] !== '_') {
            node.setAttribute(arguments[argc++], arguments[argc++]);
        } else {
            throw new Error('Invalid trailing underscore in attribute name');
        }
    }
    if (parent) {
        parent.appendChild(node);
    }
    return node;
};

// Export a node to a XML string.
Mission._NodeToXML = function (root, indentation) {
    'use strict';
    indentation = indentation || '    ';

    // Convert a single DOM element to a string
    var container = document.createElement('div');
    var elmt2str = function (elmt) {
        while (container.lastChild) {
            container.removeChild(container.lastChild);
        }
        container.appendChild(elmt.cloneNode());
        return container.innerHTML;  // we might use XMLSerializer, too
    };

    // Convert a DOM tree to a string, recursively
    var toXML = function (elmt, indent) {
        var elmtStr = elmt2str(elmt).split('><');
        var prefix = elmtStr[0];
        var suffix = '';
        if (elmtStr.length === 2) {
            prefix += '>';
            suffix = '<' + elmtStr[1];
        } else if (elmtStr.length !== 1) {
            throw new Error('toXML: invalid innerHTML string:\n' + elmtStr.join('><'));
        }
        var k;
        var str = indent + prefix + '\n';
        for (k = 0; k < elmt.childNodes.length; k++) {
            str += toXML(elmt.childNodes[k], indent + indentation);
        }
        if (suffix) {
            str += indent + suffix + '\n';
        }
        return str;
    };

    // Parse everything
    return toXML(root, '');
};
