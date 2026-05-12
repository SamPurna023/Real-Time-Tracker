const socket = io();

if(navigator.geolocation) {
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude});

    }, 
    (error) => {
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    }

);
}

const map = L.map("map").setView([0,0], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "OpenStreetMap"
}).addTo(map)

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const markers = {};

socket.on("receive-location",(data)=>{
    const {id, latitude, longitude} = data;
    map.setView([latitude, longitude], 20);
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
    }
    else{
        const isMe = id === socket.id;
        const markerOptions = isMe ? { icon: redIcon } : {};
        markers[id] = L.marker([latitude, longitude], markerOptions).addTo(map);
        const label = isMe ? "You" : "User " + id.substring(0, 4);
        markers[id].bindPopup(label);
    }
});

socket.on("user-disconnect", (id)=> {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})