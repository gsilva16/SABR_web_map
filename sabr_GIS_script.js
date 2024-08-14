require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/ScaleBar",
  "esri/widgets/Legend",
  "esri/smartMapping/renderers/relationship",
  "esri/views/layers/LayerView",
  "esri/views/layers/FeatureLayerView",
  "esri/core/reactiveUtils",
  "esri/widgets/Expand",
  "esri/smartMapping/statistics/classBreaks",
  "esri/widgets/FeatureTable",
  "esri/widgets/BasemapToggle"
], (esriConfig, Map, MapView, FeatureLayer, ScaleBar, Legend, relationshipRendererCreator, LayerView, FeatureLayerView, reactiveUtils, Expand, classBreaks, FeatureTable,BasemapToggle) => {
  (async () => {

    esriConfig.apiKey = "AAPK8f842f9f47af4822824fdb93bc774312cYJt7PpUWZ86RC8NdFNGsPSRoilYcSW-kH5c38Exn40Mz4JlzHmyckat6d2LN98o";

    const map = new Map({
      basemap: "arcgis/topographic"
    });

    const view = new MapView({
      container: "sceneDiv",
      map: map,
      center: [-81.00543, 36.42700],
      zoom: 7.95
    });
    // const listNode = document.getElementById("sabr_graphics");


    let template = {
      // autocasts as new PopupTemplate()
      title: "{LOCATION}",
      content: [
        {
          // It is also possible to set the fieldInfos outside of the content
          // directly in the popupTemplate. If no fieldInfos is specifically set
          // in the content, it defaults to whatever may be set within the popupTemplate.
          type: "fields",
          fieldInfos: [
            {
              fieldName: "EP_MOBILE",
              label: "% of mobile homes"
            },
            {
              fieldName: "wet_qrtr_d",
              label: "Change in percipitation (mm) of the wettest quarter"
            }
          ]
        }
      ]
    };

    const sabrLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/HLC8bAygObK4fhPW/arcgis/rest/services/SABR/FeatureServer",
      // id:"aba061d530cf405bb0fdd239e824b76b",
      outFields: ["*"],
      popupTemplate: template
    });
    const params = {
      layer: sabrLayer,
      view: view,
      field1: {
        field: "EP_MOBILE",
        label: "% of mobile homes"
      },
      field2: {
        field: "wet_qrtr_d",
        label: "Change in percipitation (mm) of the wettest quarter"
      },
      focus: null,
      defaultSymbolEnabled: false,
      legendOptions: {
        showLegend: true
      }
    };

    // when the promise resolves, apply the renderer to the layer
    relationshipRendererCreator.createRenderer(params)
      .then(function (response) {
        sabrLayer.renderer = response.renderer;
        params.renderer = response.renderer;
      });

    map.add(sabrLayer);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const featureTable = new FeatureTable({
      view: view,
      layer: sabrLayer,
      relatedRecordsEnabled: true,
      container: "tableDiv"
    });

    reactiveUtils.when(
      () => view.stationary,
      () => {
        // Filter out and show only the visible features in the feature table.
        featureTable.filterGeometry = view.extent;
      },
      {
        initial: true
      }
    );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const toggle = new BasemapToggle({
      view: view, // view that provides access to the map's 'topo-vector' basemap
      nextBasemap: "hybrid" // allows for toggling to the 'hybrid' basemap
    });

    view.ui.add(toggle, "top-left");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    // const layerListExpand = new Expand({
    //   expandIcon: "layers",  // see https://developers.arcgis.com/calcite-design-system/icons/
    //   // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
    //   view: view,
    //   content: layerList
    // });
    // view.ui.add(layerListExpand, "top-left");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const legend = new Expand({
      content: new Legend({
        view: view,
        style: "classic" // other styles include 'classic'
      }),
      view: view,
      expanded: true
    });
    view.ui.add(legend, "bottom-left");

    sabrLayer.when(() => {
    });

    // let graphics;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const layerView = await view.whenLayerView(sabrLayer);
    await reactiveUtils.whenOnce(() => !layerView.updating);
    const sabrFields = layerView.availableFields;

    var select = document.getElementById("selectVar1");
    var select2 = document.getElementById("selectVar2");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    populateDropdowns(sabrFields);
    // function to populate the dropdown choices with the list of variables in the file
    function populateDropdowns(fields) {
      for (var i = 0; i < sabrFields.length; i++) {
        let opt = sabrFields[i];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
      }
      for (var i = 0; i < sabrFields.length; i++) {
        var opt = sabrFields[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select2.appendChild(el);
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    let var1Val = params.field1.field;
    let var2Val = params.field2.field;
    let curVar1 = document.getElementById("selectVar1");
    let curVar2 = document.getElementById("selectVar2");
    curVar1.addEventListener("change", changedVar1);
    curVar2.addEventListener("change", changedVar2);

    // When you choose a different variable for the first field
    function changedVar1() {
      var1Val = curVar1.value;
      params.field1.field = var1Val;
      params.field1.label = 'newlabel1';

      updateRenderer(params);

      template.content[0].fieldInfos[0].fieldName = var1Val;
      template.content[0].fieldInfos[0].label = "newlabel1";
      sabrLayer.popupTemplate = template;
    }

    // When you choose a different variable for the second field
    function changedVar2() {
      var2Val = curVar2.value;
      params.field2.field = var2Val;
      params.field2.label = 'newlabel2';

      updateRenderer(params);

      template.content[0].fieldInfos[1].fieldName = var2Val;
      template.content[0].fieldInfos[1].label = "newlabel2";
      sabrLayer.popupTemplate = template;
    }

    // this creates a new renderer with the new selected variable
    // the update renderer function was awful and not easy to use
    // doesn't seem to take much memory or server calls
    function updateRenderer(curParams) {
      relationshipRendererCreator.createRenderer(curParams)
        .then(function (response) {
          sabrLayer.renderer = response.renderer;
        });
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////





    // view.popup.defaultPopupTemplateEnabled = true;

    // view.when(() => {
    //   const popupTemplate = sabrLayer.createPopupTemplate();
    //   sabrLayer.popupTemplate = popupTemplate;
    // });
    // console.log(typeof sabrLayer);
    // reactiveUtils.when(
    //   () => !layerView.dataUpdating,
    //   async () => {
    //       // query all the features available for drawing.
    //       try {
    //         const featureSet = await layerView.queryFeatures({
    //           outFields: layerView.availableFields,
    //           geometry: view.extent,
    //           returnGeometry: true,
    //           orderByFields: ["FIPS"]
    //         });
    //         console.log(layerView.attributes);
    //         console.log("AAAAAAAAAAA")
    //         console.log(featureSet);

    //         graphics = featureSet.features;

    //         const fragment = document.createDocumentFragment();

    //         graphics.forEach((result, index) => {
    //           const attributes = result.attributes;
    //           const name = attributes.NAME;

    //           // Create a list zip codes in NY
    //           const li = document.createElement("li");
    //           li.classList.add("panel-result");
    //           li.tabIndex = 0;
    //           li.setAttribute("data-result-id", index);
    //           li.textContent = name;

    //           fragment.appendChild(li);
    //         });
    //         // Empty the current list
    //         listNode.innerHTML = "";
    //         listNode.appendChild(fragment);
    //       } catch (error) {
    //         console.error("query failed: ", error);
    //       }
    //   }
    // );
    // console.log(sabrLayer.)

    // const onListClickHandler = async (event) => {
    //           const target = event.target;
    //           const resultId = target.getAttribute("data-result-id");

    //           // get the graphic corresponding to the clicked zip code
    //           const result = resultId && graphics && graphics[parseInt(resultId, 10)];

    //           if (result) {
    //             try {
    //               await view.goTo(result.geometry.extent.expand(2));

    //               view.openPopup({
    //                 features: [result],
    //                 location: result.geometry.centroid
    //               });
    //             } catch (error) {
    //               if (error.name != "AbortError") {
    //                 console.error(error);
    //               }
    //             }
    //           }
    //         };
    // listen to click event on the zip code list
    // listNode.addEventListener("click", onListClickHandler);

  })();
});