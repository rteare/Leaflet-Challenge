// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Send the data.features object to the createFeatures function
    createFeatures(data.features);
});

// Create marker color based off depth of earthquake
function markerColor(depth) {
    var color= "";
    if (depth > 90) {color = "red"}
    else if (depth > 70) {color = "orangered"}
    else if (depth > 50) {color = "orange"}
    else if (depth > 30) {color = "yellow"}
    else if (depth > 10) {color = "greenyellow"}
    else {color = "lime"}

    return color;
};

function createFeatures(earthquakeData) {

    d3.json(queryUrl, function (data) {
        console.log(data)
        // // Create marker color based off depth of earthquake
        // function markerColor(depth) {
        //     var color= "";
        //     if (depth > 90) {color = "red"}
        //     else if (depth > 70) {color = "orangered"}
        //     else if (depth > 50) {color = "orange"}
        //     else if (depth > 30) {color = "yellow"}
        //     else if (depth > 10) {color = "greenyellow"}
        //     else {color = "lime"}

        //     return color;
        // };
        
        // Create marker size based of magnitude
        function markerRadius(mag) {
            return mag * 3;
        };

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the function once for each piece of data in the array
        var earthquakes = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng);
            },

            style: function (feature, layer) {
                return{
                    fillOpacity: 0.8,
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: "black",
                    weight: 0.5,
                    radius: markerRadius(feature.properties.mag),
                    stroke: true
                };
            },

            // Define a function we want to run once for each feature in the features array
            // Give each feature a popup describing the place and time of the earthquake
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h3>Location: " + feature.properties.place + 
                "</h3><hr><p>Date & Time: " + new Date(feature.properties.time) + 
                "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>" +
                "</p><hr><p>Depth: " + feature.geometry.coordinates[2] + "</p>");
            },
                       
        })
      
        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes);       
    });
}

// Build map
function createMap(earthquakes) {
  
    // Define layers
    // Satelitemap layer
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // Darkmap Layer
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Lightmap Layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    // Outdoormap Layer
    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    // Streetmap Layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 10,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satellitemap,
        "Grayscale Map": lightmap,
        "Outdoors Map": outdoorsmap,
        "Dark Map": darkmap,
        "streetmap": streetmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the lightmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [40, -40],
        zoom: 3,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create the legend for he map explaining the colors
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function(myMap) {
        let div = L.DomUtil.create('div', 'legend'),
            labels = ['<strong>Richter Scale</strong>']
            colors = ["lime", "greenyellow", "yellow", "orange", "orangered", "red"];
        
        let key = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+']    

        for(i = 0; i < colors.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<i style="background:' + colors[i] + '"></i><span>' + key[i] + '</span>'
                );
        };
        div.innerHTML = labels.join('<br>');
        
        return div;
    };
    legend.addTo(myMap);
};