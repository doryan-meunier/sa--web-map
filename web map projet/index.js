document.addEventListener("DOMContentLoaded", function () {
    var maCarte = L.map('maCarte').setView([46.603354, 1.888334], 2);
    var markersCluster = L.markerClusterGroup();
    var geojson;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(maCarte);

    // Charger le GeoJSON et créer la carte avec les marqueurs
    fetch('festivals-global-festivals-_-pl.geojson')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            geojson = data;

            L.geoJSON(geojson, {
                onEachFeature: function (feature, layer) {
                    var popupContent = `
                        <b>${feature.properties.nom_du_festival}</b><br>
                        <b>Période principale :</b> ${feature.properties.periode_principale_de_deroulement_du_festival}<br>
                        <b>Code postal :</b> ${feature.properties.code_postal_de_la_commune_principale_de_deroulement}<br>
                        <b>Site Internet :</b> <a href="${feature.properties.site_internet_du_festival}" target="_blank">${feature.properties.site_internet_du_festival}</a>`;
                    layer.bindPopup(popupContent);
                }
            }).addTo(markersCluster);

            // Ajouter les marqueurs au groupe de clusters
            markersCluster.addTo(maCarte);
        })
        .catch(function (error) {
            console.error('Erreur lors du chargement du GeoJSON :', error);
        });

    // Gérer la recherche à chaque modification de la barre de saisie
    document.getElementById('barreDeSaisie').addEventListener('input', function () {
        rechercherFestival(this.value);
    });

    function rechercherFestival(nomFestival) {
        markersCluster.clearLayers(); // Effacer tous les marqueurs existants du groupe

        geojson.features.forEach(function (feature) {
            // Vérifier si les coordonnées sont disponibles
            if (feature.geometry && feature.geometry.coordinates) {
                var nomLowerCase = feature.properties.nom_du_festival.toLowerCase();
                if (nomLowerCase.includes(nomFestival.toLowerCase()) || nomFestival.trim() === "") {
                    // Construire le contenu de la popup avec toutes les informations nécessaires
                    var popupContent = `
                        <b>${feature.properties.nom_du_festival}</b><br>
                        <b>Période principale :</b> ${feature.properties.periode_principale_de_deroulement_du_festival}<br>
                        <b>Code postal :</b> ${feature.properties.code_postal_de_la_commune_principale_de_deroulement}<br>
                        <b>Site Internet :</b> <a href="${feature.properties.site_internet_du_festival}" target="_blank">${feature.properties.site_internet_du_festival}</a>`;

                    // Ajouter le marqueur au groupe
                    var marker = L.marker(feature.geometry.coordinates.slice().reverse())
                        .bindPopup(popupContent);
                    markersCluster.addLayer(marker);
                }
            }
        });

        // Ajouter le groupe de marqueurs à la carte à la fin
        maCarte.addLayer(markersCluster);
    }

    // Charger les données depuis index.php et ajouter des marqueurs à la carte
    fetch('index.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(festival => {
                L.marker([festival.latitude, festival.longitude])
                    .addTo(maCarte)
                    .bindPopup(festival.nom + "<br>" + festival.adresse);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des données:', error));
});
