var fs = require('fs'),
    events = require('events'),
    util = require('util'),
    path = require('path'),
    tilelive = require('tilelive'),
    millstone = require('millstone'),
    carto = require('carto');

require('tilelive-mapnik').registerProtocols(tilelive);

// -------
// Start Map Cache
//
// In-process cache of the Mapnik XML template we generate, and the localized
// MML we use to do so..
var Cache = function(options) {
    events.EventEmitter.call(this);

    // Can this be more simple?
    this.queued = false;
    this.available = false;

    // TODO make mml filename & directory attribute on the model.
    this.filename = options.filename;
    this.base = path.normalize(__dirname + '/../'+ options.base +'/');
}
util.inherits(Cache, events.EventEmitter);

Cache.prototype.load = function() {
    this.queued = true;

    var that = this,
        actions = [];

    // First, load and parse the mml.
    actions.push(function(next) {
        fs.readFile(path.join(that.base, that.filename), 'utf8', next);
    });

    // Localize our mml.
    actions.push(function(next, err, data) {
        if (err) return next(err);

        millstone.resolve({
            mml: JSON.parse(data),
            base: that.base,
            cache: path.normalize(__dirname + '/../files/cache')
        }, next);
    });

    // Let carto transform the mml to mapnik xml.
    actions.push(function(next, err, resolved) {
        if (err) return next(err);

        that.mml = resolved; // todo do we need this?

        new carto.Renderer({filename: that.filename}).render(resolved, next);
    });

    actions.push(function(next, err, xml) {
        if (err) return next(err);

        // Setup the basic map "uri" for mapnik.
        var uri = {
            protocol: 'mapnik:',
            slashes: true,

            // This file does not exist; but we pass in literal strings below.
            // This is used as a cache key.
            pathname: path.join('resources/gain-map', 'foo.xml'),
            query: {
                //updated: map.mml._updated,
                bufferSize: 0,
                metatile: 16,
            },
        };

        // Merge in the XML and MML from our cache.
        uri.xml = _.template(xml, {});
        
        // http://trac.mapnik.org/wiki/OutputFormats?version=8#PNGQuantization
        // reduce colors to 50 so that png encoding is faster and the tiles are smaller
        // if you see color degradation increase c higher, up to 256
        that.mml.format = "png8:c=50"
        
        uri.mml = that.mml;
        
        tilelive.load(uri, next);
    });

    _(actions).reduceRight(_.wrap, function(err, source) {
        if (err) return that.emit('error', err);
        that.source = source;
        that.queued = false;
        that.available = true;
        that.emit('available');
        that.removeAllListeners('available');
    })();
};

Cache.prototype.get = function(callback) {
    var that = this;

    if (this.available) {
        return callback(null, this.source);
    } else {
        // If not even queued yet, get going!
        if (!this.queued) this.load();

        this.on('available', function() {
            if (that.err) return callback(that.err);
            return callback(null, that.source);
        });
    }
};

// End map cache
// -----

var mapCache = {};
var getSource = function(model, callback) {
    var options = {
        base: model.get('base'),
        filename: model.get('filename')
    };
    var id = path.resolve(options.base, options.filename);

    if (mapCache[id] == undefined) {
        mapCache[id] = new Cache(options);
        // setup cleanup task.
    }

    mapCache[id].get(callback);
};

models.Tileset.prototype.sync = function(method, model, options) {
    if (method != 'read') return options.error('Method not supported: ' + method);

    getSource(model, function(err, source) {
        if (err) return options.error(err);

        model.source = source;
        options.success();
    });
};
