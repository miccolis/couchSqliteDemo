view = Backbone.View.extend({
    initialize: function(options) {
        options = options ||{};

        this.width = options.width || 640;
        this.height = options.height || 630;
        this.extent = options.extent || false;

        _.bindAll(this, 'updateMap');

        this.model.bind('change:version', this.updateMap);
    },
    render: function() { 
        this.updateMap();
        return this;
    },
    updateMap: function() {
        options = this.options;

        var mm = com.modestmaps,
            tilejson = this.model.tilejson();

        var mapEl= $("<div></div>").addClass('map');
        $(this.el).empty().append(mapEl); // don't just empty, deprecate then remove...

        var m = new mm.Map(mapEl[0], new wax.mm.connector(tilejson), new mm.Point(this.width, this.height), [
            new mm.DragHandler,
            new mm.DoubleClickHandler,
            new mm.MouseWheelHandler,
            new mm.TouchHandler
        ]);

        this.m = m;

        if (!this.extent) {
            m.setCenterZoom(new mm.Location(this.model.get('lat'), this.model.get('lon')), this.model.get('z'));
        } else {
            m.setExtent([
                new mm.Location(extent[1], extent[0]),
                new mm.Location(extent[3], extent[2])
            ]);
        }
    }
});
