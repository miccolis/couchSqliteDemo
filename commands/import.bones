var path = require('path'),
    sqlite3 = require('sqlite3'),
    Couch = require(path.dirname(require.resolve('backbone-couch')) + '/couch.js');

command = Bones.Command.extend();

command.description = 'set up application and install databases';

command.prototype.initialize = function(plugin) {
    var file = path.normalize(__dirname + '/../resources/map/layers/hoods.sqlite');
    var sql = 'SELECT OGC_FID, pop90, povrate from nbhdcomposition';

    var database = new Couch({
        host: plugin.config.couchHost,
        port: plugin.config.couchPort,
        name: plugin.config.couchPrefix + '_data'
    });

    (new sqlite3.Database(file, sqlite3.OPEN_READONLY)).each(sql, function(err, row) {
        row._id = '/api/Hood/' + row.OGC_FID;
        database.put(row, function(err) {
            if (err) console.warn(err);
        });
    });
}
