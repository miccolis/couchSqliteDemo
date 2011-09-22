model = Backbone.Model.extend({
    url: function() {
        return '/api/Hood/' + this.id;
    }
});
