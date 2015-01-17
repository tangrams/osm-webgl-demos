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
        // add visibility toggles for each layer
        var layer_controls = {};
        Object.keys(layer.scene.config.layers).forEach(function(l) {
            if (layer.scene.config.layers[l] == null) {
                return;
            }
            layer_controls[l] = !(layer.scene.config.layers[l].style.visible == false);
            gui.
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
