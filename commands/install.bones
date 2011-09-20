var fs = require('fs'),
    _ = require('underscore')._;

command = Bones.Command.extend();

command.description = 'set up application and install databases';

command.prototype.initialize = function(plugin) {
    var config = plugin.config;

    // Install CouchDB databases.
    var command = this;
    config.databases.split(':').forEach(function(dbName) {
        command.installDB(plugin, dbName);
    });
};

command.prototype.installDB = function(plugin, dbName) {
    var config = plugin.config;
    var options = {
        host: config.couchHost,
        port: config.couchPort,
        name: config.couchPrefix + '_' + dbName,
        basename: dbName
    };
    var designDocs = getDesignDocs(dbName);

    var couch = require('backbone-couch')(options);

    couch.install(function(err) {
        if (err) {
            console.error('%s', err);
        }
        else {
            designDocs && couch.db.putDesignDocs(designDocs);
            console.log('Installed database %s', dbName);
        }
    });
};

var getDesignDocs = function(dbName) {
    var dir = [process.cwd(), 'design-docs', dbName].join('/');

    try {
        if (fs.statSync(dir).isDirectory) {
            return _(fs.readdirSync(dir)).map(function(val) {
               return dir + '/' + val;
            });
        }
    } catch (err) {   }
}

