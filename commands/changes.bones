var couch_sqlite = require('couch-sqlite');

command = Bones.Command.extend();
command.description = 'listen for changes';
command.prototype.initialize = function(options) {
    var schema = "OGC_FID INTEGER, 'pop90' INTEGER, 'povrate' FLOAT";

    var connection = couch_sqlite({
        sqlite: options.config.files + '/data.sqlite',
        table: 'data',
        schema: schema,
        couchHost: options.config.couchHost,
        couchPort: options.config.couchPort,
        couchDb: options.config.couchPrefix + '_data',
        map: function(record) {
            var item = {
                OGC_FID: record.OGC_FID,
                pop90: record.pop90,
                povrate: record.povrate
            };
            return item;
        }
    });
    connection.on('error', function(err) {
        console.warn(err);
    });
    connection.run(true);
};
