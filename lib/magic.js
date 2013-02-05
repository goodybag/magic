/**
 * Global magic interface communications super highway of tubes
 * Or just an event system right now. Maybe an interface to a cli later
 */

var
  events = require('events')

, Magic = function(){}
;

Magic.prototype = new events.EventEmitter();

module.exports = new Magic();