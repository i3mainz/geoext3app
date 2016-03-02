"use strict";

Ext.define("SppAppClassic.view.main.map.GeoExtMap", {
    extend: "GeoExt.component.Map",

    xtype: "geoextmap",

    requires: [
        "SppAppClassic.view.main.map.GeoExtMapController",
        "GeoExt.data.store.LayersTree",
        "SppAppClassic.store.Layers",
        "LayerGroups",
        //"layerStyles",
        "Projects"
        //"SppAppClassic.view.main.Popup",    // xtype: "popup"
    ],

    controller: "main-geoextmap",

    initComponent: function () {
        console.log("init GeoExtMap...");
        var me = this;

        var ol3Map = new ol.Map({
            layers: [
                LayerGroups.basemaps,
                LayerGroups.hydrology,
                LayerGroups.darmc
            ],  // get laoded dynamically in MapController
            controls: [
                new ol.control.ScaleLine(),
                new ol.control.Attribution()
            ],
            // ol.control.defaults().extend(  // keeps default controls

            interactions: ol.interaction.defaults().extend([
                // highlight features on hover, click events are seperate -> this is just highlight
                new ol.interaction.Select({
                    condition: ol.events.condition.pointerMove  // empty -> select on click
                })
            ]),

            // renderer: CANVAS,
            // Improve user experience by loading tiles while dragging/zooming. Will make
            // zooming choppy on mobile or slow devices.
            //loadTilesWhileInteracting: true,

            view: new ol.View({
                center: ol.proj.fromLonLat([8.751278, 50.611368]),  // [0, 0],
                zoom: 4,  // 2,
                minZoom: 3  // prevents zoom too far out
                //restrictedExtent: new ol.extent(-180, -90, 180, 90)  // prevents going over 'edge' of map
            })
        });

        var layerGroup = ol3Map.getLayerGroup();

        // set map
        me.map = ol3Map;  // set Ol3 map

        // set layertree's store
        var treeStore = Ext.create("GeoExt.data.store.LayersTree", {
            layerGroup: layerGroup,
            storeId: "treeStore"  // register with storemanager
        });
        Ext.getCmp("layerTree").setStore(treeStore);

        // dynamically adding layers doesnt work!
        // workaround: add all, then remove restricted

        // remove AG intern if it already exists
        //var internLayer = me.getLayerByName("Harbours (AG Intern)");
        //me.removeLayer(internLayer);
        if (SppAppClassic.app.isAuthorized()) {

            me.addLayer(LayerGroups.fetch);
            me.addLayer(LayerGroups.barrington);
            me.addLayer(LayerGroups.agIntern);
            me.addLayer(LayerGroups.spp);
            //console.log("done add");
            // add layer to project internal
            var projectID = me.getProjectIdFromCookie(cookie);

            if (projectID) {  // known cookie login
                // create ag intern layer
                var layer = me.createAGInternLayer(projectID);
                //me.addLayer(layer);
                me.addLayerToLayerGroup(layer, "Project Internal");
            }

            console.log("done set layers for users");

        } else {
            console.log("set layers for guests");
            me.addLayer(LayerGroups.sppOpen);
            console.log("done set layers for guest");
        }
        console.log("creating layers!");
        //removeRestrictedLayerGroups

        me.createLayersFromStore();
        console.log("all layers created!");

        // add custom listeners
        // keep inheritance
        //this.callParent(); // doesnt work, use workaround below
        // $owner error has something to do with initComponent being a protected method
        // in ExtJs6
        SppAppClassic.view.main.map.GeoExtMap.superclass.initComponent.call(this);
    },

    /**
     * looks up layer information from layerStore and
     * dynamically creates wms or geoJSON layers
     */
    createLayersFromStore: function(cookie) {
        var me = this;

        // dont add restricted layers if not authorized
        var showRestricted = false;
        if (SppAppClassic.app.isAuthorized()) {
            showRestricted = true;  // workaround .. only add if group exists
        }

        var layersStore = Ext.create("SppAppClassic.store.Layers");

        layersStore.each(function(layer) {

            console.log("layer: " + layer.get("layerName").split(":")[1]);
            console.log(me.getLayerByName(layer.get("layerName").split(":")[1]));
            if (!me.getLayerByName(layer.get("layerName"))) {  // skip if layer exists already
                var newLayer;
                if (layer.get("type") === "WMS") {
                    var legend = layer.get("legendName");
                    var legendHeight = layer.get("legendHeight");
                    if (legend) {
                        if (typeof legend === "string" || legend instanceof String) {  // legendName specified
                            if (legendHeight) {
                                newLayer = me.createWMSLayer(layer.get("title"), layer.get("layerName"), layer.get("legendName"), legendHeight);
                            } else {
                                newLayer = me.createWMSLayer(layer.get("title"), layer.get("layerName"), layer.get("legendName"));
                            }
                        } else {  // legendName true, use layerName as legendName
                            if (legendHeight) {
                                newLayer = me.createWMSLayer(layer.get("title"), layer.get("layerName"), layer.get("layerName"), legendHeight);
                            } else {
                                newLayer = me.createWMSLayer(layer.get("title"), layer.get("layerName"), layer.get("layerName"));
                            }
                        }

                    } else {
                        newLayer = me.createWMSLayer(layer.get("title"), layer.get("layerName"));
                    }

                } else if (layer.get("type") === "GeoJSON") {
                    //ame, sourceName, legendUrl, layerStyle, isVisible
                    if (layer.get("layerStyle")) {
                        newLayer = me.createGeoJSONLayer(layer.get("title"), layer.get("layerName"), false, layer.get("layerStyle"), layer.get("isVisible"));
                    } else {
                        newLayer = me.createGeoJSONLayer(layer.get("title"), layer.get("layerName"), false, false, layer.get("isVisible"));
                    }
                } else {
                    console.log("type " + layer.get("type") + " not supported yet!");
                }

                // add layer to specified group
                var group = me.getLayerGroupByName(layer.get("group"));
                if (group) {  // only add if group exists
                    group.getLayers().push(newLayer);  // push to layer collection
                } else {
                    console.log("group: " + layer.get("group") + " doesnt exist!");
                }
            }


        });
    },

    /**
     * Checks cookie and returns the corresponding project ID
     */
    getProjectIdFromCookie: function(cookie) {
        var id;
        var projects = Projects.projectList;
        for (var key in projects) {
            var project = projects[key];
            if (cookie === key) {
                id = project.id;
            }
        }
        return id;
    },

    /**
     * returns url of the geoserver legend for a layer.
     * layer string needs to be in format "<workspace>:<layername>"
     * e.g. "SPP:harbours"
     */
    getLegendImg: function(layer, height, width) {
        height = height || 25;
        width = width || 25;
        var finalWms = wms + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=" + width + "&TRANSPARENT=true&HEIGHT=" + height + "&LAYER=" + layer +
                        "&legend_options=fontName:Arial;fontAntiAliasing:true;fontSize:6;dpi:180";
        return finalWms;
    },

    /**
     * returns list of layers that are currently active (no layergroups)
     * OUTDATED: use getLayers(true) instead
     */
    getActiveLayers: function(onlyVectors) {
        /* returns a list of OL3 Layer objects
        that includes all selected nodes.
        isVector: if true, only active Vectorlayers are returned,
        WMS layers are ommitted */
        onlyVectors = onlyVectors || false;  // set default to false

        var activeLayers = [];

        var layerGroups = this.map.getLayers();
        layerGroups.forEach(function(layerGroup) {      // loop layergroups
            var layers = layerGroup.getLayers();
            layers.forEach(function(layer, i) {         // loop layers
                if (layer.getVisible()) {               // skip inactive layers
                    var source = layer.getSource();
                    if (onlyVectors) {
                        if (source instanceof ol.source.Vector) {
                            activeLayers.push(layer);
                        }
                    } else {
                        activeLayers.push(layer);
                    }
                }
            });
        });
        return activeLayers;
    },

    /**
     * returns list of layer. option to only return currently active layers.
     * this overwrites the geoext3 method, which just returns the layergroups
     */
    getLayers: function(activeOnly) {
        activeOnly = activeOnly || false;  // set default to false

        var activeLayers = [];

        var layerGroups = this.map.getLayers();
        layerGroups.forEach(function(layerGroup) {      // loop layergroups
            var layers = layerGroup.getLayers();
            layers.forEach(function(layer) {         // loop layers
                if (activeOnly) {
                    if (layer.getVisible()) {               // skip inactive layers
                        activeLayers.push(layer);
                    }
                } else {
                    activeLayers.push(layer);
                }
            });
        });
        return activeLayers;
    },

    /**
     * returns list of layer groups
     */
    getLayerGroups: function() {
        var groupList = [];
        var layerGroups = this.map.getLayers();
        layerGroups.forEach(function(layerGroup) {
            if (layerGroup instanceof ol.layer.Group) {
                groupList.push(layerGroup);
            }
        });
        return groupList;
    },

    /**
     * returns the specified layer group
     */
    getLayerGroupByName: function(groupName) {
        var layerGroups = this.map.getLayers();
        var result;
        layerGroups.forEach(function(layerGroup) {
            if (layerGroup instanceof ol.layer.Group) {
                if (layerGroup.get("name") === groupName) {
                    result = layerGroup;
                }
            }
        });
        return result;
    },

    /**
     * returns layer by its assigned name in layertree (not source name)
    */
    getLayerByName: function(layername, activeOnly) {
        activeOnly = activeOnly || true;

        var resultlayer;
        var layers;
        if (activeOnly) {
            layers = this.getActiveLayers(true);
        } else {
            this.getLayers();
        }

        layers.forEach(function(layer, i) {
            if (layer.get("name") === layername) {
                resultlayer = layer;
            }
        });
        return resultlayer;
    },

    /**
     * returns layer's source name (e.g. 'v_public_offen' for layer 'Open')
    */
    getLayerSourceNameByLayername: function(layername) {
    },

    /**
     * creates a ol.layer.Tile layer with a ol.source.TileWMS
     * as it's source
     */
    createWMSLayer: function(name, sourceName, legendName, legendHeight) {
        legendName = legendName || false;
        legendHeight = legendHeight || false;
        var layer = new ol.layer.Tile({
            name: name,
            source: new ol.source.TileWMS({
                url: wms,
                params: {"LAYERS": sourceName, "TILED": true},
                serverType: "geoserver",
                wrapX: false   // dont repeat on X axis
            }),
            visible: false
        });
        if (legendName) {
            var legendUrl;
            if (legendHeight) {
                if (legendHeight === "fetch") {
                    console.log("found fetch!");
                    legendUrl = this.getLegendImg(legendName, 10, 25);
                    layer.set("legendHeight", legendHeight);
                } else {
                    legendUrl = this.getLegendImg(legendName);
                    console.log("legendHeight: " + legendHeight + " not supported! using default height");
                }
            } else {  // no legendHeight specified
                legendUrl = this.getLegendImg(legendName);
            }
            layer.set("legendUrl", legendUrl);
        }
        return layer;
    },

    /**
     * creates a ol.layer.Vector layer with a ol.source.Vector from ol.format.GeoJSON
     * as it's source
     */
    createGeoJSONLayer: function(name, sourceName, legendUrl, layerStyle, isVisible) {
        legendUrl = legendUrl || "";
        layerStyle = layerStyle || "";
        isVisible = isVisible || false;

        var workspace = sourceName.split(":")[0];
        var layerName = sourceName.split(":")[1];

        var layer = new ol.layer.Vector({
            name: name,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return proxy +
                            "bereich=" + workspace +
                            "&layer=" + layerName +
                            "&bbox=" + extent.join(",") +
                            "&epsg=" + "4326";
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                })),
                wrapX: false  // dont repeat on X axis
            }),
            visible: isVisible
        });

        if (layerStyle) {
            layer.setStyle(layerStyle);
        } else {
            layer.setStyle("style", LayerStyles.redPoints);  // default
        }

        if (legendUrl) {
            layer.set("legendUrl", legendUrl);
        }

        return layer;
    },

    /**
     * layername needs to be complete with workspace (e.g. "SPP.Data")
     */
    createVectorSource: function(layername, filter) {
        console.log("creating source!");
        var vectorSource;
        // "http://haefen.i3mainz.hs-mainz.de/GeojsonProxy/layer?bereich=SPP&layer=road&bbox=-9.60676288604736,23.7369556427002,53.1956329345703,56.6836547851562&epsg=4326"
        filter = filter || "";

        //var PROXY_URL = "http://haefen.i3mainz.hs-mainz.de/GeojsonProxy/layer?";
        var workspace = layername.split(":")[0];
        var layer = layername.split(":")[1];
        //var BBOX = "-9.60676288604736,23.7369556427002,53.1956329345703,56.6836547851562";
        var EPSG = "4326";

        if (filter !== "") {
            console.log("creating source for " + layername + " using filter: " + filter);
            vectorSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent, resolution, projection) {
                    return SppAppClassic.app.globals.proxyPath +
                        "bereich=" + workspace +
                        "&layer=" + layer +
                        "&epsg=" + EPSG +
                        "&CQL_FILTER=" + filter;
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                }))
            });
        } else {  // no filter
            console.log("creating source for " + layername + " without any filters!");
            vectorSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent, resolution, projection) {
                    return SppAppClassic.app.globals.proxyPath +
                        "bereich=" + workspace +
                        "&layer=" + layer +
                        "&epsg=" + EPSG;
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                }))
            });
        }
        return vectorSource;
    },

    createAGInternLayer: function(projectID) {
        console.log("spp_harbours_project" + projectID + "_intern");
        var layer = new ol.layer.Vector({
            name: "Harbours (internal)",
            source: new ol.source.Vector({  // TODO create class for vector source
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return proxy +
                            "bereich=" + "SPP" +
                            "&layer=" + "spp_harbours_project" + projectID + "_intern" +
                            "&bbox=" + extent.join(",") +
                            "&epsg=" + "4326";
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                })),
                wrapX: false  // dont repeat on X axis
            }),
            legendUrl: getLegendImg("SPP:spp_harbours_intern"),
            //style: LayerStyles.styleFunction,
            style: LayerStyles.orangePoints,
            visible: false
        });
        return layer;
    },

    addLayerToLayerGroup: function(layer, layerGroupName) {

        var layerGroups = this.map.getLayers();

        layerGroups.forEach(function(layerGroup) {      // loop layergroups

            if (layerGroup.get("name") === layerGroupName) {
                // get current layers
                var layers = layerGroup.getLayers();  // returns collection
                layers.push(layer);
                layerGroup.setLayers(layers);
            }
        });
    },

    /**
     * takes a list of restricted layer group names and removes
     * all layergroups that are in this list if they exist in the
     * GeoExt3 map
    */
    removeRestrictedLayerGroups: function(restrictedGroupsList) {
        var me = this;
        var layerGroups = me.getLayerGroups();
        layerGroups.forEach(function(layerGroup) {

            console.log(layerGroup.get("name"));
            if (restrictedGroupsList.indexOf(layerGroup.get("name")) > -1) {  // groupName is restricted
                console.log("is restricted!");
                me.removeLayer(layerGroup);
            }
        });
    },

    // TODO: keep previous qcl filter intact -> right now it gets overwritten
    /**
     * takes an sql-string. creates a new source for the layer and
     * updates the layer's source
     * layername needs to be complete with workspace (e.g. "SPP.Data")
     */
    applyFilterToLayer: function(layerName, filterString) {
        var layer = this.getLayerByName(layerName);  // this.getView()

        //var newSource = this.createVectorSource("SPP:Data", filterString);
        var newSource = this.createVectorSource("SPP:Data");

        layer.setSource(newSource);  // this refreshes automatically*/
    },

    /**
     * creates a legend image -> or html -> based on an Open Layers
     * style
     */
    createLegendImgFromOlStyle: function(style) {

    }
});
