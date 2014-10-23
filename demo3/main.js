(function () {

    // Get location from URL
    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.70531887544228, -74.00976419448853, 16],
        'Seattle': [47.609722, -122.333056, 15]
    };
    var map_start_location = locations['New York'];
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split(',');
    if (url_hash.length == 3) {
        map_start_location = url_hash.slice(0, 3);
    }
    else if (url_hash.length == 1 && url_hash != "") {
        map_start_location = locations[url_hash[0]];
    }

    // Put current state on URL
    function updateURL() {
        var map_latlng = map.getCenter();
        var url_options = [map_latlng.lat, map_latlng.lng, map.getZoom()];
        window.location.hash = url_options.join(',');
    }

    // Leaflet map
    var map = L.map('map', {
        maxZoom: 20,
        inertia: false,
        keyboard: true
    });
    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    map.on('moveend', updateURL); // update URL hash on move

    // Tangram layer
    var layer = Tangram.leafletLayer({
        vectorTileSource: {
            type: 'GeoJSONTileSource',
            url:  'http://vector.mapzen.com/osm/all/{z}/{x}/{y}.json'
        },
        vectorLayers: 'layers.yaml',
        vectorStyles: 'styles.yaml',
        attribution: 'Map data &copy; OpenStreetMap contributors | <a href="https://github.com/tangrams/tangram">Source Code</a>',
        unloadInvisibleTiles: false,
        updateWhenIdle: false
    });
    var scene = layer.scene;
    window.scene = scene;

    // Resize map to window
    function resizeMap() {
        document.getElementById('map').style.width = window.innerWidth + 'px';
        document.getElementById('map').style.height = window.innerHeight + 'px';
        map.invalidateSize(false);
    }
    window.addEventListener('resize', resizeMap);
    resizeMap();

    // Create dat GUI
    function addGUI () {
        var gui = new dat.GUI();
        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;

        // add color controls for each layer
        var layer_controls = {};
        scene.layers.forEach(function(l) {
            if (scene.styles.layers[l.name] == null) {
                return;
            }

            var mycolor = scene.modes[l.name+"-mode"].shaders.uniforms.u_color;
            layer_controls[l.name] = [mycolor[0] * 255, mycolor[1] * 255, mycolor[2] * 255];
            gui.
                addColor(layer_controls, l.name).
                onChange(function(value) {
                    scene.modes[l.name+"-mode"].shaders.uniforms.u_color = [value[0]/255., value[1]/255., value[2]/255.];
                    scene.dirty = true;
                });
        });

        // add visibility toggles for each layer, in a folder
        var layer_gui = gui.addFolder('Layers');
        var layer_controls = {};
        scene.layers.forEach(function(l) {
            if (scene.styles.layers[l.name] == null) {
                return;
            }

            layer_controls[l.name] = !(scene.styles.layers[l.name].visible == false);
            layer_gui.
                add(layer_controls, l.name).
                onChange(function(value) {
                    scene.styles.layers[l.name].visible = value;
                    scene.rebuild();
                });
        });

    }

    // Add map
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
        });
        layer.addTo(map);
    });

}());
