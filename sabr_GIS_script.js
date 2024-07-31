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
  "esri/smartMapping/statistics/classBreaks"
], (esriConfig, Map, MapView, FeatureLayer, ScaleBar, Legend, relationshipRendererCreator, LayerView, FeatureLayerView, reactiveUtils, Expand,classBreaks) => {
  (async () => {

    esriConfig.apiKey = "AAPK8f842f9f47af4822824fdb93bc774312cYJt7PpUWZ86RC8NdFNGsPSRoilYcSW-kH5c38Exn40Mz4JlzHmyckat6d2LN98o";

    const map = new Map({
      basemap: "arcgis/topographic"
    });

    const view = new MapView({
      container: "sceneDiv",
      map: map,
      center: [-81.00543, 36.42700],
      zoom: 7
    });
    const listNode = document.getElementById("sabr_graphics");




    //Trailheads feature layer (points)




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
              fieldName: "EP_UNINSUR",
              label: "% of uninsured people"
            },
            {
              fieldName: "developed",
              label: "Change in developed land area from 2020-2040"
            }
          ]
        }
      ]
    };
    // console.log(template.content[0].fieldInfos[1].fieldName);

    const sabrLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/HLC8bAygObK4fhPW/arcgis/rest/services/SABR_MAP/FeatureServer/",
      // id:"aba061d530cf405bb0fdd239e824b76b",
      outFields: ["*"],
      popupTemplate: template
    });
    const params = {
      layer: sabrLayer,
      view: view,
      field1: {
        field: "EP_UNINSUR",
        label: "% of uninsured people"
      },
      field2: {
        field: "developed",
        label: "Change in developed land area from 2020-2040"
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
    //     classBreaks({
    //       layer:sabrLayer,
    //       field: params.field1.field,
    //       numClasses:3
    //     }).then(function(response) {
    //    let breakInfos = response.classBreakInfos;
    //    params.field1.classBreakInfos = response.classBreakInfos;   
    //   });

    //   classBreaks({
    //     layer:sabrLayer,
    //     field: params.field2.field,
    //     numClasses:3
    //   }).then(function(response) {
    //  let breakInfos = response.classBreakInfos;
    //  params.field2.classBreakInfos = response.classBreakInfos;   
    // });
    //     params.numClasses = 3;

    //     console.log(sabrLayer.renderer);
      });

    map.add(sabrLayer);

    
    
    // console.log(params);
    const legend = new Expand({
      content: new Legend({
        view: view,
        style: "classic" // other styles include 'classic'
      }),
      view: view,
      expanded: true
      // view:view,
      // container:'legendDiv'
    });
    view.ui.add(legend, "bottom-left");

    sabrLayer.when(() => {
      // console.log(sabrLayer);
      // console.log(sabrLayer.fields);
    });

    let graphics;



    const layerView = await view.whenLayerView(sabrLayer);
    await reactiveUtils.whenOnce(() => !layerView.updating);
    const sabrFields = layerView.availableFields;

    var select = document.getElementById("selectVar1");
    var select2 = document.getElementById("selectVar2");


    for (var i = 0; i < sabrFields.length; i++) {
      let opt = sabrFields[i];
      let el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
      // select2.appendChild(el);
    }
    for (var i = 0; i < sabrFields.length; i++) {
      var opt = sabrFields[i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      // select.appendChild(el);
      select2.appendChild(el);
    }
    
    let var1Val =params.field1.field ;
    let var2Val = params.field2.field;
    let curVar1 = document.getElementById("selectVar1");
    let curVar2 = document.getElementById("selectVar2");
    // console.log(curVar1);
    console.log(params);
    curVar1.addEventListener("change",changedVar1);
    curVar2.addEventListener("change",changedVar2);
    
    function changedVar1(){
      var1Val = curVar1.value;
      // console.log("variable 1:" +var1Val);

      params.field1.field=var1Val;
      params.field1.label = 'newlabel1';

      classBreaks({
        layer:sabrLayer,
        field: var1Val,
        numClasses:3
      }).then(function(response) {
     let breakInfos = response.classBreakInfos;
     params.field1.classBreakInfos = response.classBreakInfos;   
    });

    relationshipRendererCreator.updateRenderer(params)
    .then(function (response) {
      sabrLayer.renderer = response.renderer;
    });

    }
    
    function changedVar2(){
      var2Val = curVar2.value;
      params.field2.field = var2Val;
      params.field2.label = 'newlabel2';

      updateRenderer(params);

      template.content[0].fieldInfos[1].fieldName = var2Val;
      template.content[0].fieldInfos[1].label = "newlabel2";
      sabrLayer.popupTemplate = template;

      
    //   classBreaks({
    //     layer:sabrLayer,
    //     field: var2Val,
    //     numClasses:3
    //   }).then(function(response) {
    //  let breakInfos = response.classBreakInfos;
    // //  console.log(breakInfos);
    //  params.field2.classBreakInfos = response.classBreakInfos;   
    // //  console.log(params);
    // });
      
    // // console.log(cb2);

    //   relationshipRendererCreator.updateRenderer(params)
    //   .then(function (response) {
    //     sabrLayer.renderer = response.renderer;
    //   });
    //   map.add(sabrLayer);
    //   console.log(sabrLayer.renderer);
    }


    function updateRenderer(curParams) {
      relationshipRendererCreator.createRenderer(curParams)
      .then(function (response) {
        sabrLayer.renderer = response.renderer;
    });}

    // console.log(sabrFields);
    
    // download(jsonData, 'json.txt', 'text/plain'); 

    


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