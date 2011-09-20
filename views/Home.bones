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
                fid: hood.get('OGC_FID'),
                population: hood.get('pop90'),
                poverty: hood.get('povrate')
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
            var fid = parseInt($('td', this).get(0).innerText),
                pop90 = parseInt($('td', this).get(1).innerText),
                povrate = parseFloat($('td', this).get(2).innerText);

            var model = collection.get(fid),
                changes = false;

            if (model.get('pop90') !=  pop90) {
                changes = changes || {}
                changes.pop90 = pop90; 
            }
            if (model.get('povrate') != povrate) {
                changes = changes || {}
                changes.povrate = povrate; 
            }

            if (changes) {
                redraw = true;
                model.set(changes).save();
            }
        });

        if (redraw) {
            this.mapView.trigger('redraw');
        }
    }
});
