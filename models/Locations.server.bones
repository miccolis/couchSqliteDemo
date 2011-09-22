var path = require('path'),
    Couch = require(path.dirname(require.resolve('backbone-couch')) + '/couch.js');

var read = function(collection, options) {
    var config = Bones.plugin.config;
    var database = new Couch({
        host: config.couchHost,
        port: config.couchPort,
        name: config.couchPrefix + '_data'
    });

    var opts = {include_docs: 'true'};

    database.view('_design/backbone/_view/collection', opts, function(err, body) {
        if (err) return options.error(err);
        options.success(_(body.rows).pluck('doc'));
    });
};

var update = function() {

};

models.Locations.prototype.sync = function(method, collection, options) {
    switch(method) {
        case 'read':
            return read(collection, options);

        case 'update':
            return update(collection, options);

    }
};
