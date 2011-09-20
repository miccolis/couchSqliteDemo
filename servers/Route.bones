server = servers.Route.augment({
    initialize: function(parent, app) {
        parent.call(this, app);
        this.use(new servers['Tile'](app));
    },
    initializeAssets: function(parent, app) {
        parent.call(this, app);
        this.get('/assets/bones/wax.js', this.assets.wax);
    }
});

server.prototype.assets.wax = new mirror([
    require.resolve('modestmaps/modestmaps.min'),
    require.resolve('wax/dist/wax.mm')
], { type: '.js' });

server.prototype.assets.all = new mirror([
    server.prototype.assets.vendor,
    server.prototype.assets.wax,
    server.prototype.assets.core,
    server.prototype.assets.routers,
    server.prototype.assets.models,
    server.prototype.assets.views,
    server.prototype.assets.templates
], { type: '.js' });
