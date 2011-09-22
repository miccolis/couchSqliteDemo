var couchSqlite = require('couch-sqlite');

command = Bones.Command.extend();
command.description = 'listen for changes';
command.prototype.initialize = function(options) {
    var schema = "iso_codes VARCHAR, wb_names VARCHAR, factor INTEGER";

    var c = options.config;

    couchSqlite({
        sqlite: options.config.files + '/data.sqlite',
        table: 'data',
        schema: schema,
        couchUri: 'http://' + c.couchHost +':'+ c.couchPort +'/'+ c.couchPrefix + '_data',
    }).map(function(record) {
        if (record && record._id == '_design/backbone') return;

        var item = {
            iso_codes: record.iso_codes,
            wb_names: record.wb_names,
            factor: record.factor
        };
        return item;
    }).on('error', function(err) {
        console.warn(err);
    }).run(true);
};
