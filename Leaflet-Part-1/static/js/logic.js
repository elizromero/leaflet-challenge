//Part 1 MAPPING

// Create the map base
let baseMap = L.map("map", {
    center: [20.0, 5.0],
    zoom: 2
});

// Inserting map layer (image)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(baseMap);

// USGS GeoJSON URL 
let earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';


// Marker color based on earthquake depth 

function getColor(depth) {
    if (depth <= 10) return "#00FF00";  // Green
    else if (depth <= 30) return "#ADFF2F"; // Yellow-Green
    else if (depth <= 50) return "#FFD580"; // Light Orange
    else if (depth <= 70) return "#FFA500"; // Orange
    else if (depth <= 90) return "#FF4500"; // Dark Orange
    else return "#FF0000"; // Red
}

// Marker radious based on the
function getRadius(magnitude) {
    return magnitude ? magnitude * 5 : 1;
}

// d3 function 
d3.json(earthquakeDataUrl).then(function (data) {
    
    let geojson = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]), 
                color: '#FFFFFF',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.6
            });
        },
        onEachFeature: function (feature, layer) {
            // Use bindTooltip instead of bindPopup
            layer.bindTooltip(`<strong>Magnitude:</strong> ${feature.properties.mag}<br>
                               <strong>Location:</strong> ${feature.properties.place}<br>
                               <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`, 
                               {
                                   permanent: false,  // true for always visible
                                   direction: 'top',  // Tooltip position relative to the marker
                                   offset: [0, -10]   
                               }); 
        }
    }).addTo(baseMap);

    // Function for legend
    addLegend(geojson);
});


// Legend config
function addLegend(geojson) {
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        // Create the container for the legend
        let div = L.DomUtil.create("div", "info legend");

        // Add a title to the legend
        div.innerHTML = "<h4>Earthquake Depth (km)</h4>";

        // Depth limits and corresponding colors
        let limits = [-10, 10, 30, 50, 70, 90];
        let colors = [
            "#00FF00", // Green
            "#ADFF2F", // Yellow-Green
            "#FFD580", // Light Orange
            "#FFA500", // Orange
            "#FF4500", // Dark Orange
            "#FF0000"  // Red
        ];

        // Generate legend labels dynamically
        for (let i = 0; i < limits.length; i++) {
            let from = limits[i];
            let to = limits[i + 1] ? limits[i + 1] : "+";

            div.innerHTML += `
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <span style="
                        display: inline-block; 
                        width: 20px; 
                        height: 20px; 
                        background-color: ${colors[i]};
                        margin-right: 10px;
                        border: 1px solid #000;">
                    </span>
                    ${from} - ${to} km
                </div>
            `;
        }

        return div;
    };

    legend.addTo(baseMap);
}
