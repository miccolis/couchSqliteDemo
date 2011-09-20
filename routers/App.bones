router = Backbone.Router.extend({
    routes: {
        '/': 'home',
    },

    // The `home` route...
    home: function() {
        var router = this,
            fetcher = this.fetcher(),
            collection = new models.Hoods();

        fetcher.push(collection);
        fetcher.fetch(function(err) {
            if (err) return router.send(views.Error(err));

            router.send(views.Home, {collection: collection});
        });
    },

    // Helper to assemble the page title.
    pageTitle: function(view) {
        var title =  'What is Bones?';
        return (view.pageTitle ? view.pageTitle + ' | ' + title : title);
    },

    // The send method is...
    send: function(view) {
        var options = (arguments.length > 1 ? arguments[1] : {});
        var v = new view(options);

        // Populate the #page div with the main view.
        $('#page').empty().append(v.el);

        // TODO explain this!
        v.render().attach().activeLinks().scrollTop();

        // Set the page title.
        document.title = this.pageTitle(v);
    },

    // Generic error handling for our Router.
    error: function(error) {
        this.send(views.Error, _.isArray(error) ? error.shift() : error);
    },

    // Helper to fetch a set of models/collections in parrellel.
    fetcher: function() {
        var models = [];

        return {
            push: function(item) { models.push(item) },
            fetch: function(callback) {
                if (!models.length) return callback();
                var errors = [];
                var _done = _.after(models.length, function() {
                    callback(errors.length ? errors : null);
                });
                _.each(models, function(model) {
                    model.fetch({
                        success: _done,
                        error: function(error) {
                            errors.push(error);
                            _done();
                        }
                    });
                });
            }
        }
    }
});
