view = Backbone.View.extend({
    initialize: function(options) {
        options = options ||{};

        this.width = options.width || 680;
        this.height = options.height || 700;
        this.extent = options.extent || false;
    },
    render: function() { 
        options = this.options;

        //this.controls = options.controls || ['interaction'];

        var mm = com.modestmaps,
            tilejson = this.model.tilejson(); // add formatter...

        var mapEl= $("<div></div>").addClass('map');
        $(this.el).append(mapEl);

        var m = new mm.Map(mapEl[0], new wax.mm.connector(tilejson), new mm.Point(this.width, this.height), [
            new mm.DragHandler,
            new mm.DoubleClickHandler,
            new mm.MouseWheelHandler,
            new mm.TouchHandler
        ]);

        this.m = m; // Not using set/get to avoid needless comparisons;

        // Setup our tool tip.
        //this.tooltip = new wax.tooltip();
        //var that = this;
        //this.tooltip.click = function(feature, context, index) {
        //    that.featureClick(feature, context, index);
        //};
        //this.addControls();

        if (!this.extent) {
            m.setCenterZoom(new mm.Location(this.model.get('lat'), this.model.get('lon')), this.model.get('z'));
        } else {
            m.setExtent([
                new mm.Location(extent[1], extent[0]),
                new mm.Location(extent[3], extent[2])
            ]);
        }

        // Bind to the change event of the map model so that any time the year
        // or indicator is changed we automatically update the map.
        //this.bind('change', this.updateMap);
        return this;
    }
});
