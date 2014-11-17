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
        vectorTileSource: {
            type: 'GeoJSONTileSource',
            url:  window.location.origin + window.location.pathname + '../{z}-{x}-{y}.json',
            max_zoom: 16
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
