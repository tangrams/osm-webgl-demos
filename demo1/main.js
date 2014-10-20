/*jslint browser: true*/
/*global Tangram, gui */

(function () {

    // default source, can be overriden by URL
    var default_tile_source = 'demo';

    var tile_sources = {
        'demo': {
            source: {
                type: 'GeoJSONTileSource',
                // url:  'http://localhost:8000/24640.json'
                url:  'http://localhost:8000/{y}.json',
                max_zoom: 16
            },
            layers: 'layers.js',
            styles: 'styles.yaml'
        },
    };
    var osm_debug = false;

    // set tile source
    default_tile_source = "demo";

    // set start location
    var map_start_location = [40.71186988568351,-74.01727437973024,16]


    /*** Map ***/

    var map = L.map('map', {
        maxZoom: 20,
        inertia: false,
        keyboard: true
    });
    var layer = Tangram.leafletLayer({
        vectorTileSource: tile_sources[default_tile_source].source,
        vectorLayers: tile_sources[default_tile_source].layers,
        vectorStyles: tile_sources[default_tile_source].styles,
        numWorkers: 2,
        // debug: true,
        attribution: 'Map data &copy; OpenStreetMap contributors | <a href="https://github.com/tangram-map/tangram">Source Code</a>',
        unloadInvisibleTiles: false,
        updateWhenIdle: false
    });

    var scene = layer.scene;
    window.scene = scene;

    // Update URL hash on move
    // map.attributionControl.setPrefix('');
    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    // map.on('moveend', updateURL);

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
        gui.domElement.parentNode.style.zIndex = 5;
        window.gui = gui;

        // add visibility togggles for each layer
        var layer_controls = {};
        layer.scene.layers.forEach(function(l) {
            if (layer.scene.styles.layers[l.name] == null) {
                return;
            }

            layer_controls[l.name] = !(layer.scene.styles.layers[l.name].visible == false);
            gui.
                add(layer_controls, l.name).
                onChange(function(value) {
                    layer.scene.styles.layers[l.name].visible = value;
                    layer.scene.rebuildTiles();
                });
        });
    }

    function animationFrame(cb) {
        if (typeof window.requestAnimationFrame === 'function') {
            return window.requestAnimationFrame;
        } else {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function (cb) {
                    setTimeout(cb, 1000 /60);
                };
        }
    }

    function frame () {

        layer.render();
        animationFrame()(frame);
    }

    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
        });
        layer.addTo(map);

        if (osm_debug == true) {
            window.osm_layer =
                L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { opacity: 0.5 })
                .bringToFront()
                .addTo(map);
        }

        frame();
    });


}());
