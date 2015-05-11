(function () {

    // Leaflet map
    var map = L.map('map', {
        minZoom: 16,
        maxZoom: 20,
        inertia: false,
        keyboard: false,
        zoomControl: false
    });
    map.setView([40.71186988568351, -74.01727437973024], 17);

    // Tangram layer
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>',
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

        // add color controls for each layer
        var layer_gui = gui.addFolder('Layers');
        var layer_colors = {};
        var layer_controls = {};
        Object.keys(layer.scene.config.layers).forEach(function(l) {
            if (!layer.scene.config.layers[l]) {
                return;
            }

            layer_controls[l] = !(layer.scene.config.layers[l].visible == false);
            layer_gui.
                add(layer_controls, l).
                onChange(function(value) {
                    layer.scene.config.layers[l].visible = value;
                    layer.scene.rebuildGeometry();
                });
            var c = scene.styles[l+"-style"].shaders.uniforms.u_color;
            layer_colors[l] = [c[0]*255, c[1]*255, c[2]*255];
            layer_gui.
                addColor(layer_colors, l).
                onChange(function(value) {
                    scene.styles[l+"-style"].shaders.uniforms.u_color = [value[0]/255., value[1]/255., value[2]/255.];
                    scene.requestRedraw();
                });

        });
    layer_gui.open();
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
