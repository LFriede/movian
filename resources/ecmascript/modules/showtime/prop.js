/**
 * Property handling
 *
 * This code interacts tightly with the code in src/ecmascript/es_prop.c
 *
 * The general idea is that the native object (those accessed by
 * Showtime.propXXX) are not to be exposed to Javascript code directly.
 * But may only be passed as a proxied object
 *
 */


/**
 * Proxyhandler for Prop
 */
var propHandler = {

  get: function(obj, name) {

    if(name == 'toString') return function() {
      return String(Showtime.propGetValue(obj));
    }

    if(name == 'valueOf') return function() {
      return Showtime.propGetValue(obj);
    }

    return makeProp(Showtime.propGetChild(obj, name));
  },

  set: function(obj, name, value) {

    if(typeof value == 'object' && value !== null) {

      if('toRichString' in value) {
        Showtime.propSetRichStr(obj, name, value.toRichString());
        return;
      }

      if(Showtime.propIsValue(value)) {
        Showtime.propSet(obj, name, Showtime.propGetValue(value));
        return;
      }

      var x = Showtime.propGetChild(obj, name);
      if(typeof x !== 'object')
        throw "Assignment to non directory prop";

      x = makeProp(x);
      for(var i in value)
        x[i] = value[i];

    } else {
      Showtime.propSet(obj, name, value);
    }
  },

  enumerate: Showtime.propEnum,
  has: Showtime.propHas,
  deleteProperty: Showtime.propDeleteChild
}


/**
 * Helper to create a proxied version of raw showtime property object
 */
function makeProp(prop) {
  return new Proxy(prop, propHandler);
}


/**
 *
 */
function makeValue(type, v1, v2) {
  switch(type) {
  case 'set':
    return [v1];
  case 'uri':
    return [v1, v2];
  default:
    return [null];
  }
}


/**
 * Exported members
 */
exports.global = makeProp(Showtime.propGlobal());

/*-------------------------------------------------------------------------
 * Exported functions
 */
exports.print = Showtime.propPrint;

exports.setParent = Showtime.propSetParent;

exports.subscribe = Showtime.propSubscribe;
exports.deleteChilds = Showtime.propDeleteChilds;

exports.createRoot = function() {
  return makeProp(Showtime.propCreate());
}

exports.select = Showtime.propSelect;
exports.getName = Showtime.propGetName;
exports.link = Showtime.propLink;
exports.unlink = Showtime.propUnlink;
exports.sendEvent = Showtime.propSendEvent;
exports.atomicAdd = Showtime.propAtomicAdd;
exports.destroy = Showtime.propDestroy;
exports.isSame = Showtime.propIsSame;

exports.subscribeValue = function(prop, callback, ctrl) {
  return Showtime.propSubscribe(prop, function(type, v1, v2) {

    if(type == 'destroyed')
      return;

    callback.apply(null, makeValue(type, v1, v2));
  }, ctrl);
}


exports.makeProp = makeProp;

exports.makeUrl = Showtime.propMakeUrl;

exports.moveBefore = Showtime.propMoveBefore;

