model = Backbone.Model.extend({
    url: function() {
        return '/api/Location/' + this.id;
    }
});
