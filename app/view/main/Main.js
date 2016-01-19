"use strict";
/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define("SppAppClassic.view.main.Main", {
    extend: "Ext.panel.Panel",
    xtype: "app-main",
    reference: "mainpanel",  // used in MainController
    id: "mainPanel",
    requires: [
        "Ext.plugin.Viewport",              // plugins: "viewport"
        "Ext.window.MessageBox",
        "SppAppClassic.view.main.Map",      // xtype: "mappanel"
        "SppAppClassic.view.main.Popup"    // xtype: "popup"
        /*
        "Layers",
        "OL3Map",
        "LayerGroups",
        "LayerStyles"
        */
    ],

    controller: "main",
    viewModel: "main",
    plugins: "viewport",  // fullscreen

    title: "SPP Virtual Research Environment",

    layout: {
        type: "border",
        padding: 5
    },
    border: true,
    items: [{
        region: "center",
        layout: "border",
        items: [
            {
                xtype: "mappanel",  // defined in Map.js
                region: "center"
                /* mappanel includes two panels: the treepanel and the
                panel containing the GeoExt3 map component. since they both need a reference
                to the OL3 map, I dont know how to separate the logic into
                the MapModel.js file */
            },{
                xtype: "popup",  // create hidden window to use as popup later
                id: "popupWindow"  // used to reference and fill it in Map.js
            }
        ]
    }],
    listeners: {
        afterrender: "updateLogoutInfo"
    }
});
