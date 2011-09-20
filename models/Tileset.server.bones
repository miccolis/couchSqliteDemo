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
var Cache = function() {
    events.EventEmitter.call(this);

    // TODO do we really need this?
    this.available = false;

    // TODO make mml filename & directory attribute on the model.
    this.filename = 'gain.mml';
    this.base = path.normalize(__dirname + '/../resources/gain-map/');
}
util.inherits(Cache, events.EventEmitter);

Cache.prototype.load = function() {
    this.queued = true;

    var that = this,
        actions = [];

    // First, load and parse the mml.
    actions.push(function(next) {
        fs.readFile(path.join(that.base, that.filename), 'utf8', function(err, data) {
            if (err) return next(err);

            that.mml = JSON.parse(data);
            next();
        });
    });

    // Localize our mml.
    actions.push(function(next, err) {
        if (err) return next(err);
        millstone.resolve({
            mml: that.mml,
            base: that.base,
            cache: path.normalize(__dirname + '/../files/cache')
        }, function(err, resolved) {
            if (err) return next(err);

            that.mml = resolved;
            next();
        });
    });

    // Let carto transform the mml to mapnik xml.
    actions.push(function(next, err) {
        if (err) return next(err);
        new carto.Renderer({
            filename: that.filename,
        }).render(that.mml, function(err, output) {
            if (err) return this.err = err;

            that.xml = output;
            next();
        });
    });

    _(actions).reduceRight(_.wrap, function(err) {
        if (err) return that.emit('error', err);
        
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
        uri.xml = _.template(that.xml, {});
        
        // http://trac.mapnik.org/wiki/OutputFormats?version=8#PNGQuantization
        // reduce colors to 50 so that png encoding is faster and the tiles are smaller
        // if you see color degradation increase c higher, up to 256
        that.mml.format = "png8:c=50"
        
        uri.mml = that.mml;
        
        tilelive.load(uri, function(err, source) {
            if (err) return that.emit('error', err);

            that.source = source;

            that.queued = false;
            that.available = true;
            that.emit('available');
            that.removeAllListeners('available');
        });
    })();
};

// @param options object with a `success` and `error` callback.
Cache.prototype.get = function(options) {
    var that = this;

    if (this.available) {
        return options.success(that.source);
    } else {
        this.on('available', function() {
            if (that.err) {
                return options.error(that.err);
            } else {
                options.success(that.source);
            }
        });
    }
};

var mapCache = new Cache();
// End map cache
// -----


models.Tileset.prototype.sync = function(method, model, options) {
    if (method != 'read') return options.error('Method not supported: ' + method);

    // Do the intialization if we're uncached.
    if (!mapCache.available && !mapCache.queued) mapCache.load();

    // Attach the tilelive source to our model.
    mapCache.get({
        success:function(source) {
            model.source = source;
            options.success();
        },
        error: options.error
    });
}

