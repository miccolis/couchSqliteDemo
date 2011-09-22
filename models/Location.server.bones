var Couch = require('backbone-couch');

models.Location.prototype.sync = function(method, model, options) {
    var config = Bones.plugin.config;

    if (!this.id && this.get('id')) {
        this.id = this.get('id');
    }

    (new Couch({
        host: config.couchHost,
        port: config.couchPort,
        name: config.couchPrefix + '_data'
    })).sync(method, model, options);
}
