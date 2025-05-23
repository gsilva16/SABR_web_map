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
  "esri/widgets/BasemapToggle",
  "esri/layers/support/Field",
  "esri/Graphic",
  "esri/request"
], (esriConfig, Map, MapView, FeatureLayer, ScaleBar, Legend, relationshipRendererCreator, LayerView, FeatureLayerView, reactiveUtils, Expand, classBreaks, FeatureTable,BasemapToggle,Field,Graphic,request) => {
  (async () => {

    esriConfig.apiKey = "AAPK8f842f9f47af4822824fdb93bc774312cYJt7PpUWZ86RC8NdFNGsPSRoilYcSW-kH5c38Exn40Mz4JlzHmyckat6d2LN98o";
    const portalUrl = "https://www.arcgis.com";
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
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const shapefileUpload = document.getElementById("uploadForm");
    const shapefileDownload = document.getElementById("downloadProcessedFile");

    // shapefileUpload.addEventListener("change", (event) => {
    //   const fileName = event.target.value.toLowerCase();

    //   if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user
    //     generateFeatureCollection(fileName);
    //   }
    //   else {
    //     document.getElementById('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
    //   }
    // });

    async function uploadShapefile(e){
        e.preventDefault();
        const fileName = e.target.value.toLowerCase();

      if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user
        const uploadedShapefile = document.getElementById('inShapeFile').files;
        const formData = new FormData();

        Object.keys(uploadedShapefile).forEach(key => {
          formData.append(uploadedShapefile.item(key).name,uploadedShapefile.item(key));
        });

        const response = await fetch('http://localhost:8000/upload',
          {
            method: 'POST',
            body: formData
          }
        );

        const json = await response.json();
        console.log('In script uploadShapefile function');
        console.log(json);
        clearGraphics();
        generateFeatureCollection('C:\\Users\\guilh\\OneDrive\\Desktop\\sabr_web\\processed_files\\'+json.processed_file+'_processed.zip');
      }
      else {
        document.getElementById('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
      }
    }

    shapefileUpload.addEventListener('change',uploadShapefile);
    async function downloadShapefile(){

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    // when the promise resolves, apply the renderer to the layer
    relationshipRendererCreator.createRenderer(params)
      .then(function (response) {
        params.layer.renderer = response.renderer;
        params.renderer = response.renderer;
      });

    map.add(sabrLayer);

    function clearGraphics() {

      // alert('clear map');
      // console.log(map.graphics)
      map.layers.removeAll();
    
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    function generateFeatureCollection (fileName) {
      let name = fileName.split(".");
      // Chrome adds c:\fakepath to the value - we need to remove it
      name = name[0].replace("c:\\fakepath\\", "");

      document.getElementById('upload-status').innerHTML = '<b>Loading </b>' + name;

      // define the input params for generate see the rest doc for details
      // https://developers.arcgis.com/rest/users-groups-and-items/generate.htm
      const params2 = {
        'name': name,
        'targetSR': view.spatialReference,
        'maxRecordCount': 10000,
        'enforceInputFileSizeLimit': false,
        'enforceOutputJsonSizeLimit': false
      };

      // generalize features to 10 meters for better performance
      params2.generalize = true;
      params2.maxAllowableOffset = 10;
      params2.reducePrecision = true;
      params2.numberOfDigitsAfterDecimal = 0;

      const myContent = {
        'filetype': 'shapefile',
        'publishParameters': JSON.stringify(params2),
        'f': 'json',
      };
      console.log(params);
      console.log(document.getElementById('uploadForm'));
      // use the REST generate operation to generate a feature collection from the zipped shapefile
      request(portalUrl + '/sharing/rest/content/features/generate', {
        query: myContent,
        body: document.getElementById('uploadForm'),
        responseType: 'json'
      })
      .then((response) => {
          const layerName = response.data.featureCollection.layers[0].layerDefinition.name;
          document.getElementById('upload-status').innerHTML = '<b>Loaded: </b>' + layerName;
          addShapefileToMap(response.data.featureCollection);
          
          updateRenderer(params);
          console.log(params.layer);
        })
        .catch(errorHandler);
    }
  
    function errorHandler (error) {
      console.log(error.message);
      document.getElementById('upload-status').innerHTML =
      "<p style='color:red;max-width: 500px;'>" + error.message + "</p>";
    }

    function addShapefileToMap (featureCollection) {
      console.log("IN Other function");
      // add the shapefile to the map and zoom to the feature collection extent
      // if you want to persist the feature collection when you reload browser, you could store the
      // collection in local storage by serializing the layer using featureLayer.toJson()
      // see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage
      let sourceGraphics = [];

      const layers = featureCollection.layers.map((layer) => {

        const graphics = layer.featureSet.features.map((feature) => {
          return Graphic.fromJSON(feature);
        })
        sourceGraphics = sourceGraphics.concat(graphics);
        const featureLayer = new FeatureLayer({
          objectIdField: "FID",
          source: graphics,
          outFields: ["*"],
          popupTemplate: template,
          fields: layer.layerDefinition.fields.map((field) => {
          return Field.fromJSON(field);
          })
        });
        params.layer = featureLayer;
        // getLayerFields(featureLayer);
        return featureLayer;
        // associate the feature with the popup on click to enable highlight and zoom to
      });
      map.addMany(layers);
      view.goTo(sourceGraphics)
      .catch((error) => {
        if (error.name != "AbortError"){
          console.error(error);
        }
      });

      document.getElementById('upload-status').innerHTML = "";
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const featureTable = new FeatureTable({
      view: view,
      layer: params.layer,
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

    const layerView = await view.whenLayerView(params.layer);
    await reactiveUtils.whenOnce(() => !layerView.updating);
    const sabrFields = layerView.availableFields;

    function getLayerFields(layer){
      const curLayerView = view.whenLayerView(layer);
      // await reactiveUtils.whenOnce(()=> !layerView.updating);
      const curFields = curLayerView.availableFields;
      console.log(curFields);
    }

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
      params.layer.popupTemplate = template;
    }

    // When you choose a different variable for the second field
    function changedVar2() {
      var2Val = curVar2.value;
      params.field2.field = var2Val;
      params.field2.label = 'newlabel2';

      updateRenderer(params);

      template.content[0].fieldInfos[1].fieldName = var2Val;
      template.content[0].fieldInfos[1].label = "newlabel2";
      params.layer.popupTemplate = template;
    }

    // this creates a new renderer with the new selected variable
    // the update renderer function was awful and not easy to use
    // doesn't seem to take much memory or server calls
    function updateRenderer(curParams) {
      console.log("PARAMS");
      console.log(params);
      relationshipRendererCreator.createRenderer(curParams)
        .then(function (response) {
          curParams.layer.renderer = response.renderer;
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