/**
 * Global magic interface communications super highway of tubes
 * Or just an event system right now. Maybe an interface to a cli later
 */

var events  = require('events');

var util = require('util');
var Magic = function() {
};

util.inherits(Magic, events.EventEmitter);

module.exports = new Magic();
