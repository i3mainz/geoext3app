"use strict";
/**
 * returns the image url for a specific layer
 */
function getLegendImg(layer, height, width) {
    height = height || 25;
    width = width || 25;
    return "http://haefen.i3mainz.hs-mainz.de" + "/SPP/wms?" + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=" + width + "&TRANSPARENT=true&HEIGHT=" + height + "&LAYER=" + layer +
                    "&legend_options=fontName:Arial;fontAntiAliasing:true;fontSize:6;dpi:180";
}

/**
 * singleton classes get created when they are defined. no need to Ext.create them.
 * access them via the class-name directly. e.g. LayerStyles.bluePoints
 * variable is globally available
 */
Ext.define("LayerGroups", {
    singleton: true,

    requires: [
        "ConfigService",
        "LayerStyles"
    ],

    layers: [

        // Basemaps
        new ol.layer.Group({
            name: "Basemaps",
            layers: new ol.Collection([

                new ol.layer.Tile({
                    name: "Mapbox OSM",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/shanyuan.cifqgurif027ut0lxxf08w6gz/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                        attributions: [new ol.Attribution({
                            html: "© <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a> " +
                                "© <a href='http://www.openstreetmap.org/copyright'>" +
                                "OpenStreetMap contributors</a>"
                        })]
                    }),
                    legendUrl: "https://otile4-s.mqcdn.com/tiles/1.0.0/osm/4/4/7.jpg",
                    visible: true
                }),

                new ol.layer.Tile({
                    name: "MapQuest Satelite",
                    source: new ol.source.MapQuest({
                        layer: "sat",
                        wrapX: false
                    }),
                    legendUrl: "https://otile4-s.mqcdn.com/tiles/1.0.0/sat/4/4/7.jpg",
                    visible: false
                })

            ])
        }),

        // Hydrology
        new ol.layer.Group({
            name: "Hydrology",
            layers: new ol.Collection([

                new ol.layer.Tile({
                    name: "Lakes",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:lakes", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'Freshwater lakes in Europe. Provided by RGZM',
                    visible: false
                }),

                new ol.layer.Tile({
                    name: "Streams",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:streams", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'Major waterways of Europe. Provided by RGZM',
                    visible: false
                }),

                new ol.layer.Vector({
                    name: "Eckholdt 1980",
                    source: new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: function(extent) {
                            return ConfigService.paths.proxyPath +
                                    "bereich=" + "SPP" +
                                    "&layer=" + "Fluesse_Eckholdt" +
                                    "&bbox=" + extent.join(",") +
                                    "&epsg=" + "4326";
                        },
                        strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                            maxZoom: 19
                        })),
                        wrapX: false  // dont repeat on X axis
                    }),
                    style: LayerStyles.eckholdtStyleFunction,
                    description: 'Die Schiffbarkeit von kleinen Flüssen Mitteleuropas in Römerzeit und Mittelalter lässt sich laut Martin Eckholdt anhand der Wasserführung Q [m³/s] abschätzen. Diese berechnete er nach der Fließformel von Manning-Strickler. Zu sehen sind Flüsse auf Grundlage des Ecrins-Datensatzes, welcher auf die behandelten Flüsse Eckholdts reduziert wurde. Einige seiner aufgeführten Flüsse sind in der heutigen Zeit nicht mehr vorhanden und hier nicht dargestellt. Andere Flüsse fallen aufgrund fehlender digitalisierter Datenbestände weg. Breit dargestellte Flüsse visualisieren eine nachgewiesene Schiffbarkeit, bzw. Die damals mögliche Schiffbarkeit. Mit abnehmender Strichstärke der Flüsse nimmt auch die Schiffbarkeit der Flüsse ab.',
                    visible: false
                }),

                new ol.layer.Tile({
                    name: "OpenSeaMap",
                    source: new ol.source.XYZ({
                        url: "http://t1.openseamap.org/seamark/{z}/{x}/{y}.png",
                        attributions: [new ol.Attribution({
                            html: "© <a href='http://www.openseamap.org/'>OpenSeaMap</a>"
                        })]
                    }),
                    legendUrl: "http://wiki.openseamap.org/images/thumb/e/ec/MapFullscreen.png/400px-MapFullscreen.png",
                    visible: false
                })
            ]),
            visible: false
        }),

        // AWMC
        new ol.layer.Group({
            name: "AWMC",
            layers: new ol.Collection([
                new ol.layer.Tile({
                    name: "Basemap",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.map-knmctlkh/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                        wrapDateLine: true,
                        transitionEffect: "resize",
                        attribution: "Tiles &copy; <a href='http://mapbox.com/' target='_blank'>MapBox</a> | " +
                            "Data &copy; <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> and contributors, CC-BY-SA |"+
                            " Tiles and Data &copy; 2013 <a href='http://www.awmc.unc.edu' target='_blank'>AWMC</a>" +
                            " <a href='http://creativecommons.org/licenses/by-nc/3.0/deed.en_US' target='_blank'>CC-BY-NC 3.0</a>"
                    }),

                    description: "The AWMC base map. In addition to imagery derived from OSM and Mapbox, this map has the Inland Water, River Polygons, Water Course Center Lines, Base Open Water Polygons, supplemental water polygons (not listed below, for areas far outside of the scope of the Barrington Atlas ) layers. Please see the individual listings below for data citations. It is suitable for most applications when left on its own, or  in combination with water polygons for a particular time period (archaic, Roman, etc).",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Coast Outline",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.eoupu8fr/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: [
                        "<strong>Coast Outline</strong>",
                        'Coast outline of the ancient world, generally following the ',
                        '<a href="http://www.worldcat.org/oclc/43970336" target=_blank>Barrington Atlas</a>',
                        ' and built from <a href="http://earth-info.nga.mil/publications/vmap0.html" target=_blank>VMap0</a> and ',
                        '<a href="http://www.openstreetmap.org/about" target=_blank>OSM</a>, with additional work by the AWMC.'
                    ].join(""),
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Roads",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.awmc-roads/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Benthos Water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.s5l5l8fr/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Inland Water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.awmc-inland-water/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "River Polygons",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.9e3lerk9/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Significant rivers, generally following the Barrington Atlas with additions from VMap0 and OSM and further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Water Course Center Lines",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.awmc-water-courses/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Lines following ancient rivers, generally following the Barrington Atlas with additions from VMap0 and OSM and further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Base Open Water Polygons",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.h0rdaemi/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons, generally following the Barrington Atlas with additions from VMap0 and OSM and further work by the AWMC. These are shared by all time periods.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Archaic water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.yyuba9k9/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons which differ for the Archaic period only, generally following the Barrington Atlas with further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Classical water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.l5xc4n29/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons which differ for the Classical period only, generally following the Barrington Atlas with further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Hellenistic Water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.gq0ssjor/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons which differ for the Hellenistic period only, generally following the Barrington Atlas with further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Roman water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.ymnrvn29/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons which differ for the Roman period only, generally following the Barrington Atlas with further work by the AWMC.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Late Antiquity water",
                    source: new ol.source.XYZ({
                        url: "http://api.tiles.mapbox.com/v4/isawnyu.t12it3xr/{z}/{x}/{y}.png?access_token=" + ConfigService.mapboxAccessToken,
                    }),
                    description: "Water polygons which differ for the Late Antiquity period only, generally following the Barrington Atlas with further work by the AWMC.",
                    visible: false
                })
            ])
        }),

        // EMODnet
        new ol.layer.Group({
            name: "EMODnet",
            visible: false,
            layers: new ol.Collection([
                new ol.layer.Tile({
                    name: "mean_atlas_land",
                    source: new ol.source.TileWMS({
                        url: "http://ows.emodnet-bathymetry.eu/wms",
                        params: {"LAYERS": "emodnet:mean_atlas_land", "TILED": true},
                        wrapX: false
                    }),

                    description: "This service provides bathymetric data products for the area specified by the EMODNet project. This covers the Norwegian Sea, Icelandic Sea, Celtic Seas, North Sea, Kattegat, Baltic Sea, English Channel, Bay of Biscay, Iberian Coast, West and Central Mediterranean, Adriatic Sea, Ionian Sea, Aegean Sea, Levantine Sea, Sea of Marmara, Black Sea, the Azores, Canary Islands and Madeira. The data product is provided in one eight arc minute grid, so data points are roughly 230 meters apart.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "mean_rainbowcolour",
                    source: new ol.source.TileWMS({
                        url: "http://ows.emodnet-bathymetry.eu/wms",
                        params: {"LAYERS": "emodnet:mean_rainbowcolour", "TILED": true},
                        wrapX: false
                    }),

                    description: "This service provides bathymetric data products for the area specified by the EMODNet project. This covers the Norwegian Sea, Icelandic Sea, Celtic Seas, North Sea, Kattegat, Baltic Sea, English Channel, Bay of Biscay, Iberian Coast, West and Central Mediterranean, Adriatic Sea, Ionian Sea, Aegean Sea, Levantine Sea, Sea of Marmara, Black Sea, the Azores, Canary Islands and Madeira. The data product is provided in one eight arc minute grid, so data points are roughly 230 meters apart.",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "coastlines",
                    source: new ol.source.TileWMS({
                        url: "http://ows.emodnet-bathymetry.eu/wms",
                        params: {"LAYERS": "coastlines", "TILED": true},
                        wrapX: false
                    }),

                    description: "This service provides bathymetric data products for the area specified by the EMODNet project. This covers the Norwegian Sea, Icelandic Sea, Celtic Seas, North Sea, Kattegat, Baltic Sea, English Channel, Bay of Biscay, Iberian Coast, West and Central Mediterranean, Adriatic Sea, Ionian Sea, Aegean Sea, Levantine Sea, Sea of Marmara, Black Sea, the Azores, Canary Islands and Madeira. The data product is provided in one eight arc minute grid, so data points are roughly 230 meters apart.",
                    visible: false
                })
            ])
        }),

        // DARMC
        new ol.layer.Group({
            //layers: Layers.darmc,
            name: "DARMC",
            layers: new ol.Collection([
                new ol.layer.Tile({
                    name: "Aqueducts",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_aqueducts", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Bridges",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_bridges", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Roads",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_roads", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Cities",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_cities", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Baths",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_baths", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Ports",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_ports", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Harbours",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_harbours", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Canals",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:darmc_canals", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: "<strong>The Digital Atlas of Roman and Medieval Civilizations</strong><br>A selection of layers from DARMC, mainly representing the Barrington Atlas. Go to the <a href='http://darmc.harvard.edu/map-sources' target=_blank>DARMC website</a> to get an overview of additional data sources included in each dataset. Harbour data consists of the Barrington Atlas and an older (2014) Version of \“Ancient ports and harbours\”",
                    visible: false
                })
            ]),
            visible: false
        }),
        new ol.layer.Group({
            name: "Fetch",
            layers: new ol.Collection([
                new ol.layer.Tile({
                    name: "Adria 45°(NE)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_045", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 90°(E)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_090", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 135°(SE)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_135", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 180°(S)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_180", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 225°(SW)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_225", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 270°(W)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_270", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 315°(NW)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_315", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                }),
                new ol.layer.Tile({
                    name: "Adria 360°(N)",  // title
                    source: new ol.source.TileWMS({
                        url: ConfigService.paths.wms,
                        params: {"LAYERS": "SPP:fetch_360", "TILED": true},
                        serverType: "geoserver",
                        wrapX: false   // dont repeat on X axis
                    }),
                    //legendUrl = this.getLegendImg(legendName);
                    description: 'The fetch, also called the fetch length, is the length of water over which a given wind has blown. [...] Fetch length, along with wind speed, determines the size of waves produced" (Wikipedia). Fetch can help researchers to estimate potential wave heights for harbour sites. The Fetch layers created by us can just cover limited areas and are thought as being prototypical for other areas. nIf you are interested in the fetch method please join us in our workshop at the next plenary meeting!',
                    visible: false
                })
            ]),
            visible: false
        }),

    ],

    restrictedLayers: {
        // SPP open
        sppOpen: new ol.layer.Vector({
            name: "SPP: Harbours (open)",
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return ConfigService.paths.proxyPath +
                            "bereich=" + "SPP" +
                            //"&layer=" + "spp_harbours_open" +  // spp_harbours_open
                            "&layer=" + "spp_all" +
                            "&bbox=" + extent.join(",") +
                            "&epsg=" + "4326";
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                })),
                wrapX: false  // dont repeat on X axis
            }),
            //style: LayerStyles.redPoints,
            legendUrl: getLegendImg("SPP:spp_harbours_intern"),
            style: LayerStyles.pointTypeStyleFunction, //LayerStyles.redPointLabelStyleFunction,
            description: "Data of the spp projects open to anyone interested.",
            visible: true
        }),
        spp: new ol.layer.Vector({
            name: "SPP: Harbours",
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return ConfigService.paths.proxyPath +
                            "bereich=" + "SPP" +
                            //"&layer=" + "spp_harbours_intern" +
                            "&layer=" + "spp_all" +
                            "&bbox=" + extent.join(",") +
                            "&epsg=" + "4326";
                },
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 19
                })),
                wrapX: false  // dont repeat on X axis
            }),
            //style: LayerStyles.redPoints,
            legendUrl: getLegendImg("SPP:spp_harbours_intern"),
            style: LayerStyles.pointTypeStyleFunction, //LayerStyles.redPointLabelStyleFunction,
            description: "Data of the spp projects",
            visible: true
        }),

        agIntern: new ol.layer.Group({
            layers: [],
            name: "Project Internal",
            visible: false
        }),
    },



    getLayerGroupByName: function(name) {
        for (var key in this.layers) {
            var group = this.layers[key];
            if (group instanceof ol.layer.Group) {
                if (group.get("name") === name) {
                    return group;
                }
            }
        }
    },

    /**
     * returns the layer based on the provided name.
     * this function is used to restore the origin layer's source.
     * multiple layers with the same name will not work
     */
    getLayerByName: function(layerName) {
        var result = [];

        for (var key in this.layers) {
            var group = this.layers[key];

            if (group instanceof ol.layer.Group) {  // is group
                var layers = group.getLayers();

                //var result = [];
                layers.forEach(function(layer) {
                    if (layer.get("name") === layerName) {
                        result.push(layer);
                    }
                })
            } else {  // single layer
                if (group.get("name") === layerName) {
                    result.push(group);
                }
            }


        }

        if (result.length > 1) {
            throw "Multiple layers with name: " + layerName + " found!";
        }
        return result[0];
    }

});
