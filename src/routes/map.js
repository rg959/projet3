const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();

const {Client, TravelMode} = require("@googlemaps/google-maps-services-js");

const client = new Client({});


router.post('/direction', Auth.AuthentificationUser, async(req, res) => {
    try {
        const {origin, destination, waypoints, mode} = req.body;
        if (!origin || !destination || !waypoints || !mode) res.status(400).send({success: false, message: 'Invalid body'});
        else if (waypoints.length >= 23) res.status(400).send({success: false, message: 'To much waypoints'});
        else if (mode !== 'driving' && (mode !== 'walking') && (mode !== 'bicycling')) res.status(400).send({success: false, message: 'Invalid travel mode'});
        else {
            let googleMode;

            if (mode === 'driving') {
                googleMode = TravelMode.driving;
            } else if (mode === 'walking') {
                googleMode = TravelMode.walking;
            } else {
                googleMode = TravelMode.bicycling;
            }

            // Création d'un tableau contenant tous les waypoints et le point d'arrivé
            let allDestination = []

            for (let i = 0; i < waypoints.length; i++) {
                allDestination.push(waypoints[i]);
            }
            allDestination.push(destination);

            // Création de tous les chemin possible à emprunter pour faire le calcul
            allRoutes = []
            destsLen = allDestination.length
            for (let i = 0; i < destsLen; i++) {
                waypointsArray = []
                bDests = allDestination.slice()
                let buffer = bDests[destsLen - 1]
                bDests[destsLen - 1] = bDests[i]
                bDests[i] = buffer
                for (let i = 0; i < bDests.length - 1; i++) {
                    waypointsArray.push(bDests[i]);
                }
                allRoutes.push([waypointsArray, bDests[destsLen - 1]])
            }

            // Fonction pour faire l'ensemble des requêtes de direction pour chaque trajet possible, afin d'en récupérer la durée
            resRoutes = []
            listDuration = []

            getAllDuration = (allRoutes, callback) => {
                for (let i = 0; i < allRoutes.length; i++) {
                    client.directions({
                        params: {
                            key: process.env.KEY_GOOGLE,
                            origin: origin,
                            destination: allRoutes[i][1],
                            waypoints: allRoutes[i][0],
                            optimize: true,
                            mode: googleMode,
                        }
                    })
                    .then((response) => {
                        resRoutes.push(response)
                        i = 0
                        totalTime = 0
                        while (i < response.data.routes[0].legs.length) {
                            totalTime += response.data.routes[0].legs[i].duration.value
                            i = i + 1
                        }
                        listDuration.push(totalTime)
                        if (listDuration[allRoutes.length - 1] != undefined) {
                            callback(resRoutes, listDuration);
                        }
                    })
                    .catch((error) => {
                        res.status(500).send({success: false, message: error});
                    });
                }
            }

            getAllDuration(allRoutes, (resRoutes, listDuration) => {
                let index = 0;
                let value = listDuration[0];
                for (let i = 1; i < listDuration.length; i++) {
                    if (listDuration[i] < value) {
                        value = listDuration[i];
                        index = i;
                    }
                }

                bestDest = resRoutes[index].data.routes[0].legs

                let resWaypoint = [];
                let resDestination = "";

                for (let i = 0; i < bestDest.length; i++) {
                    if (i < bestDest.length - 1) resWaypoint.push(resRoutes[index].data.routes[0].legs[i].end_address)
                    if (i === bestDest.length - 1) resDestination = resRoutes[index].data.routes[0].legs[i].end_address
                }

                res.send({success: true,origin: origin, destination: resDestination, waypoints: resWaypoint, duration: listDuration[index]});
            })
        }
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
})

module.exports = router;
