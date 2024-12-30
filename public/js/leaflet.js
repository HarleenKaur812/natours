/* eslint-disable */

export const displayMap = (locations) => {
  var map = L.map('map', {
    zoomControl: false,
    doubleClickZoom: false,
  });

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    },
  ).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);

    // Create a custom HTML element for the marker
    const el = document.createElement('div');
    el.className = 'marker'; // You can style this class with CSS to change the appearance of the marker

    // Create a marker with the custom HTML element
    const marker = L.marker([loc.coordinates[1], loc.coordinates[0]], {
      icon: L.divIcon({
        className: 'custom-marker', // Custom class for styling
        html: el.outerHTML, // Pass the HTML element as a marker
        iconSize: [30, 30], // Adjust the size of the custom marker if needed
      }),
    })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  // Disable scroll zoom if needed
  map.scrollWheelZoom.disable();
};
