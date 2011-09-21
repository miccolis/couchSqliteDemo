view = views.Main.extend({
    events: {
      'click input.refresh': 'saveData'
    },
    render: function() {
        $(this.el).empty().append(templates.Home());
        this.updateTable();
        return this;
    },
    updateTable: function() {
        var hoods = [];
        this.collection.each(function(hood) {
            hoods.push({
                iso_codes: hood.get('iso_codes'),
                wb_names: hood.get('wb_names'),
                factor: hood.get('factor')
            });
        });
        $('table', this.el).empty().append(templates.Table({hoods: hoods}));
    },
    attach: function() {
        this.mapView = new views.Map({
            el: document.querySelector('#map'),
            model: new models.Map()
        }).render();
        return this;
    },
    saveData: function(ev) {
        var collection = this.collection,
            redraw = false;

        $('table tbody tr', this.el).each(function() {
            var iso = $('td', this).get(0).innerText,
                factor = parseInt($('td', this).get(2).innerText);

            var model = collection.get(iso),
                changes = false;

            if (model.get('factor') !=  factor) {
                changes = changes || {}
                changes.factor = factor; 
            }

            if (changes) {
                redraw = true;
                model.set(changes).save();
            }
        });

        if (redraw) {
            var v = this.mapView.model.get('version').split('-');
            v[1] = parseInt(v[1]) + 1;
            this.mapView.model.set({version: v.join('-')});
        }
    }
});
