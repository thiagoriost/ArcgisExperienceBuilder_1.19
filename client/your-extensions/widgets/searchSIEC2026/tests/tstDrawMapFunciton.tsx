/**
     * Función prueba capacitación
     * @date 2024-05-30
     * @dateUpdated 2024-05-31
     * @changes Actualización Renderización al mapa base
     */
    function tstDrawMap(selCapas, cond){
      
      
        const mapEx = new Map({
          basemap: 'streets-navigation-vector'
        });

        const view = new MapView({
          container: mapDiv.current,
          map: mapEx,
          center: [-75.690601, 4.533889], // Coordenadas iniciales (Quindío, Colombia)
          zoom: 12
        });
        const selCapasURL = selCapas.replace("?f=json","");
        console.log("URL para query =>",selCapasURL);
        console.log("Formulacion WHERE => ",cond);
        const featureLayer = new FeatureLayer({
          url: selCapasURL
          //url: "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Salud_T/MapServer/6"
        });

        console.log("Query Features URL =>",featureLayer.url);

        //Definición del query
        view.when(() => {
          /* const queryTst = new Query({
            where: cond,
            outFields: ["NOMBREEQUIPAMIENTO"],
            returnGeometry: true
          }); */
          
          //URL Tst: https://totalapis.github.io/sample-code/featurelayer-query/index.html
          const queryTst = featureLayer.createQuery();
          queryTst.where = cond;
          queryTst.returnGeometry = true;
          queryTst.outFields = ["NOMBREEQUIPAMIENTO"];

          queryFeatures({
            url: featureLayer.url,
            query: queryTst
          }).then(response => {            
            const graphics = response.features.map((feature) => {
              return new Graphic({
                geometry: feature.geometry,                
                symbol: {                  
                  color: "red",
                  //size: "8px",
                  //type: "simple-marker"
                },
                attributes: feature.attributes
              });
            });
            view.graphics.addMany(graphics);
          }).catch((error) => {
            console.error("Error fetching features:", error);
          });
        });
        return () => {
          if (view) {
            view.destroy();
          }
        };

      //Renderizado al mapa
      //mapEx.add(featureLayer);
      jimuMapView.view.map.add(featureLayer);

      return <div style={{ height: '100vh' }} ref={mapDiv}></div>;
    }