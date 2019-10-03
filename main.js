// initialize the map
var lat= 41.55;
var lng= -72.65;
var zoom= 9;

//Load a tile layer base map from USGS ESRI tile server https://viewer.nationalmap.gov/help/HowTo.htm
var hydro = L.esri.tiledMapLayer({url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer"}),
    topo = L.esri.tiledMapLayer({url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer"});

var baseMaps = {
    "Hydro": hydro,
    "Topo": topo
  };


// load a tile layer base map from USGS wms_server
// var wms_server = "http://basemap.nationalmap.gov/arcgis/services/USGSHydroCached/MapServer/WMSServer?";
// var wms_options = { layers: "0", format: "image/png", attribution: "USGS"}
//
// var topographic = L.tileLayer.wms(wms_server, wms_options);
//
// topographic.addTo(map);

// L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
//     maxZoom: 18,
//     attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
// }).addTo(map);

var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    layers:[hydro]
});

map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;

L.control.attribution({position: 'bottomleft'}).addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);


var customOptions =
    {
        'maxWidth': '500',
        'className' : 'custom'
    };

var ctsites = "https://www.waterqualitydata.us/data/Station/search?organization=CTVOLMON&mimeType=geojson&zip=no"

// load GeoJSON from an external file and display circle markers
$.getJSON(ctsites,function(data){
    console.log(data);
  var marker = L.geoJson(data, {
    pointToLayer: function(feature,latlng){
      var markerStyle = {
        fillColor:'#cccccc',
        radius: 5,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
        pane: 'top'
      };
      return L.circleMarker(latlng, markerStyle);
    },
    onEachFeature: function (feature,marker) {
      var href_met = "https://www.waterqualitydata.us/data/ActivityMetric/search?siteid="+
          feature.properties.MonitoringLocationIdentifier+"&mimeType=csv&zip=yes"
      var href_bio = "https://www.waterqualitydata.us/data/Result/search?siteid="+
              feature.properties.MonitoringLocationIdentifier+"&mimeType=csv&zip=yes&dataProfile=biological"
      marker.bindPopup('<b>Stream: </b>'+
          feature.properties.MonitoringLocationName+'</br>'
          +"<b>SID: </b>"+feature.properties.MonitoringLocationIdentifier+'</br>'+
      '<a href="'+href_met+'" </a> Link to RBV Metric Data'+'</br>'+'<a href="'+href_bio+'" </a> Link to RBV Biological Data',customOptions);
    }
    }).addTo(map);
  });

// load GeoJSON of CT Boundary
var linestyle = {
    "color": "black",
    "weight": 2,
};

  $.getJSON("CT_state_boundary.geojson",function(linedata){
      console.log(linedata);
      L.geoJson(linedata,{
          style:linestyle
      }).addTo(map);
  });

//add legend
var legend = L.control({position: 'topleft'});

    // Function that runs when legend is added to map
    legend.onAdd = function (map) {
      var days = ['Sun','Mon','Tues','Wed','Thur','Fri','Sat'];
      var date = new Date();
      var year = date.getFullYear().toString();
      var month = (date.getMonth()+1).toString();
      var day = date.getDate().toString();
      // Create Div Element and Populate it with HTML
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<p class="title">Data Retrieved '+days[date.getDay()]+' '+month+'/'+day+'/'+year+'</p><br>';
      div.innerHTML += '<i class="circle" style="background: #cccccc"></i><p> RBV Site - Click for data</p><br>';

      // Return the Legend div containing the HTML content
      return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    L.control.layers(baseMaps).addTo(map);
