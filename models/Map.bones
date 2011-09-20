model = Backbone.Model.extend({
   defaults: { 
        lat:  38.9,
        lon: -77,
        z: 2,
    },
    tilejson: function() {

        var tiles = ['http://'+ location.host+'/tiles/1.0.0/foo/{z}/{x}/{y}.png'];
        var grids= ['http://'+ location.host+'/tiles/1.0.0/foo/{z}/{x}/{y}.grid.json'];

        return tilejson = {
            tilejson: '1.0.0',
            scheme: 'tms',
            tiles: tiles,
            grids: grids,
            formatter: function() { return '' },
            minzoom: 0,
            maxzoom: 6 
        };
    }
});
