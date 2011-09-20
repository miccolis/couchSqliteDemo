var path = require('path'),
    sqlite3 = require('sqlite3'),
    Couch = require(path.dirname(require.resolve('backbone-couch')) + '/couch.js');

command = Bones.Command.extend();

command.description = 'set up application and install databases';

command.prototype.initialize = function(plugin) {
    var file = path.normalize(__dirname + '/../resources/gain-map/layers/countries.sqlite');
    var sql = 'SELECT iso_codes, wb_names from country_poly';

    var database = new Couch({
        host: plugin.config.couchHost,
        port: plugin.config.couchPort,
        name: plugin.config.couchPrefix + '_data'
    });

    (new sqlite3.Database(file, sqlite3.OPEN_READONLY)).each(sql, function(err, row) {

        row._id = '/api/Hood/' + row.iso_codes;
        row.id = row.iso_codes;
        row.factor = parseInt(Math.random() * 100);

        database.put(row, function(err) {
            if (err) console.warn(err);
        });
    });
}
