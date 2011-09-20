var couch_sqlite = require('couch-sqlite');

command = Bones.Command.extend();
command.description = 'listen for changes';
command.prototype.initialize = function(options) {
    var schema = "iso_codes VARCHAR, wb_names VARCHAR, factor INTEGER";

    var connection = couch_sqlite({
        sqlite: options.config.files + '/data.sqlite',
        table: 'data',
        schema: schema,
        couchHost: options.config.couchHost,
        couchPort: options.config.couchPort,
        couchDb: options.config.couchPrefix + '_data',
        map: function(record) {
            var item = {
                iso_codes: record.iso_codes,
                wb_names: record.wb_names,
                factor: record.factor
            };
            return item;
        }
    });
    connection.on('error', function(err) {
        console.warn(err);
    });
    connection.run();
};
