model = Backbone.Model.extend({
    idAttribute: 'OGC_FID',
    url: function() {
        return '/api/Hood/' + this.id;
    }
});
