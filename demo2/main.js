(function () {

    // Leaflet map
    var map = L.map('map', {
        minZoom: 17,
        maxZoom: 17,
        inertia: false,
        keyboard: false,
        zoomControl: false
    });
    map.setView([40.71186988568351, -74.01727437973024], 17);

    // Tangram layer
    var layer = Tangram.leafletLayer({
        source: {
            type: 'GeoJSONTileSource',
            url:  window.location.origin + window.location.pathname + '../{z}-{x}-{y}.json',
            max_zoom: 16
        },
        scene: 'styles.yaml',
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
    var gui = new dat.GUI({ autoPlace: true });
    function addGUI () {
        window.gui = gui;
        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map

        var layer_controls = {};
        var layer_gui = gui.addFolder('Layers');
        // add color controls for each layer
        Object.keys(layer.scene.config.layers).forEach(function(l) {
            if (layer.scene.config.layers[l] == null) {
                return;
            }
            var c = layer.scene.config.layers[l].style.color;
            layer_colors[l] = [c[0]*255, c[1]*255, c[2]*255];
            gui.
                addColor(layer_colors, l).
                onChange(function(value) {
                    layer.scene.config.layers[l].style.color = [value[0]/255, value[1]/255, value[2]/255];
                    layer.scene.rebuildGeometry();
                    });

        // add visibility toggles for each layer, in a folder
            layer_controls[l] = !(layer.scene.config.layers[l].style.visible == false);
            layer_gui.
                add(layer_controls, l).
                onChange(function(value) {
                    layer.scene.config.layers[l].style.visible = value;
                    layer.scene.rebuildGeometry();
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
