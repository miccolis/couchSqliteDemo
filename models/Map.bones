model = Backbone.Model.extend({
   defaults: { 
        lat:  38.9,
        lon: -77,
        z: 2,
        version: Date.now() + '-0'
    },
    tilejson: function() {

        var v = this.get('version');

        var tiles = ['http://'+ location.host+'/tiles/1.0.0/'+ v +'/{z}/{x}/{y}.png'];
        var grids= ['http://'+ location.host+'/tiles/1.0.0/'+ v +'/{z}/{x}/{y}.grid.json'];

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
