/*jslint browser: true*/
/*global Tangram, gui */

(function () {

    // default source, can be overriden by URL
    var default_tile_source = 'demo';

    var tile_sources = {
        'demo': {
            source: {
                type: 'GeoJSONTileSource',
                // url:  'http://localhost:8000/demo3/potosi_bolivia.osm-line2.geojson'
                // url:  'http://localhost:8000/demo3/potosi_bolivia.osm-polygon.geojson'
                // url:  'http://localhost:8000/demo3/2.json'
                url:  'http://vector.mapzen.com/osm/all/{z}/{x}/{y}.json'
            },
            layers: 'layers.js',
            styles: 'styles.yaml'
        },
    };
    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.70531887544228, -74.00976419448853, 16],
        'Seattle': [47.609722, -122.333056, 15]
    };
    var osm_debug = false;

    /*** URL parsing ***/

    // URL hash pattern is one of:
    // #[source]
    // #[lat],[lng],[zoom]
    // #[source],[lat],[lng],[zoom]
    // #[source],[location name]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split(',');

    // Get tile source from URL
    if (url_hash.length >= 1 && tile_sources[url_hash[0]] != null) {
        default_tile_source = url_hash[0];
    }

    // Get location from URL
    // var map_start_location = locations['New York'];
    var map_start_location = locations['London'];

    if (url_hash.length == 3) {
        map_start_location = url_hash.slice(0, 3);
    }
    if (url_hash.length > 3) {
        map_start_location = url_hash.slice(1, 4);
    }
    else if (url_hash.length == 2) {
        map_start_location = locations[url_hash[1]];
    }

    if (url_hash.length > 4) {
        var url_ui = url_hash.slice(4);

        // Mode on URL?
        var url_mode;
        if (url_ui) {
            var re = new RegExp(/mode=(\w+)/);
            url_ui.forEach(function(u) {
                var match = u.match(re);
                url_mode = (match && match.length > 1 && match[1]);
            });
        }
    }

    // set tile source
    default_tile_source = "demo";

    // Put current state on URL
    function updateURL() {
        var map_latlng = map.getCenter(),
            url_options = [default_tile_source, map_latlng.lat, map_latlng.lng, map.getZoom()];

        // if (rS) {
        //     url_options.push('rstats');
        // }

        // if (gl_mode_options && gl_mode_options.effect != '') {
        //     url_options.push('mode=' + gl_mode_options.effect);
        // }

        window.location.hash = url_options.join(',');
    }

    /*** Map ***/

    var map = L.map('map', {
        maxZoom: 20,
        inertia: false,
        keyboard: false
    });
    var layer = Tangram.leafletLayer({
        vectorTileSource: tile_sources[default_tile_source].source,
        vectorLayers: tile_sources[default_tile_source].layers,
        vectorStyles: tile_sources[default_tile_source].styles,
        numWorkers: 2,
        // debug: true,
        attribution: 'Map data &copy; OpenStreetMap contributors | <a href="https://github.com/tangrams/tangram">Source Code</a>',
        unloadInvisibleTiles: false,
        updateWhenIdle: false
    });

    var scene = layer.scene;
    window.scene = scene;

    // Update URL hash on move
    // map.attributionControl.setPrefix('');
    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    map.on('moveend', updateURL);

    // Resize map to window
    function resizeMap() {
        document.getElementById('map').style.width = window.innerWidth + 'px';
        document.getElementById('map').style.height = window.innerHeight + 'px';
        map.invalidateSize(false);
    }

    window.addEventListener('resize', resizeMap);
    resizeMap();

    // Create dat GUI
    var gui = new dat.GUI();
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 5;
        window.gui = gui;

        // add color controls for each layer
        // var layer_controls = {};
        // layer.scene.layers.forEach(function(l) {
        //     if (layer.scene.styles.layers[l.name] == null) {
        //         return;
        //     }

        //     var mycolor = scene.modes[l.name+"-mode"].shaders.uniforms.u_color;
        //     layer_controls[l.name] = [mycolor[0] * 255, mycolor[1] * 255, mycolor[2] * 255];
        //     gui.
        //         addColor(layer_controls, l.name).
        //         onChange(function(value) {
        //             scene.modes[l.name+"-mode"].shaders.uniforms.u_color = [value[0]/255., value[1]/255., value[2]/255.];
        //             scene.dirty = true;
        //         });
        // });

        // add visibility togggles for each layer, in a folder
        var layer_gui = gui.addFolder('Layers');
        var layer_controls = {};
        layer.scene.layers.forEach(function(l) {
            if (layer.scene.styles.layers[l.name] == null) {
                return;
            }

            layer_controls[l.name] = !(layer.scene.styles.layers[l.name].visible == false);
            layer_gui.
                add(layer_controls, l.name).
                onChange(function(value) {
                    layer.scene.styles.layers[l.name].visible = value;
                    layer.scene.rebuildTiles();
                });
        });

        gui.height = 5;
        var height = gui.add(gui, "height", 0, 100);
        // height.onFinishChange(function(value) {
        height.onChange(function(value) {
            scene.styles.layers.buildings.filter = "function (f) { return f.properties.height > "+value+"; }";
            scene.rebuildTiles();
        });

        gui.roadwidth = 5;
        var roadwidth = gui.add(gui, "roadwidth", 0, 100);
        // roadwidth.onFinishChange(function(value) {
        roadwidth.onChange(function(value) {
            scene.styles.layers.roads.width.default = "function (f, t, h) { return "+value+"; }";
            scene.rebuildTiles();
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

            // setGLProgramDefines();
            scene.refreshModes();
            // updateURL();
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
