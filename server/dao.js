import sqlite from "sqlite3"
import { Route } from "./models.js"

const db = new sqlite.Database("game.db", (err) => {
    if (err) throw err;
})

// GET /api/trainmap
export const getTrainMap = () => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT s1.stationName AS station1Name, s2.stationName AS station2Name, l.lineColour
        FROM routes r, stations s1, stations s2, lines l
        WHERE s1.stationID = r.station1ID AND s2.stationID = r.station2ID AND l.lineID = r.lineID
        `

        db.all(sql, [], (err, row) => {
            if (err) reject(err);
            else {
                const trainMap = row.map((r) => new Route(r.station1Name, r.station2Name, r.lineColour))
                resolve(trainMap);
            }
        })
    })
}

// GET api/leaderboard
export const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        const sql = `
    SELECT u.username, u.pointsMax
    FROM users u
    WHERE u.pointsMax != 0
    ORDER BY u.pointsMax DESC LIMIT 10
    `
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}

//GET api/game/result


export const getGameResult = (userTrip, startStation, arriveStation, routes) => {
    return new Promise((resolve, reject) => {

        const getOtherStation = (route, fromStation) => {
            if (route.station1Name === fromStation) return route.station2Name;
            if (route.station2Name === fromStation) return route.station1Name;
            return null;
        }

        let currentStation = startStation;

        for (let i = 0; i < userTrip.length; i++) {
            const routeExists = routes.some(r =>
                r.station1Name === userTrip[i].station1Name &&
                r.station2Name === userTrip[i].station2Name &&
                r.lineColour === userTrip[i].lineColour
            );
            if (!routeExists) {
                return resolve({ "isValid": false, "finalPoints": 0, "eventsFound": [] });
            }

            const nextStation = getOtherStation(userTrip[i], currentStation);
            if (nextStation === null) {
                return resolve({ "isValid": false, "finalPoints": 0, "eventsFound": [] });
            }

            currentStation = nextStation;
        }

        if (currentStation !== arriveStation) {
            return resolve({ "isValid": false, "finalPoints": 0, "eventsFound": [] });
        }

        const eventQuery = `SELECT * FROM events`;
        db.all(eventQuery, [], (err, events) => {
            if (err) reject(err);
            else {
                const eventsFound = [];
                let pointsChanged = 0;
                for (let i = 0; i < userTrip.length; i++) {
                    const randomIndex = Math.floor(Math.random() * events.length);
                    eventsFound.push(events[randomIndex]);
                    pointsChanged += events[randomIndex].points;
                }
                return resolve({
                    "isValid": true,
                    "finalPoints": 20 + pointsChanged,
                    "eventsFound": eventsFound
                });
            }
        })
    })
}

//prende lo user dalla mail, serve per l'autenticazione
export const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT u.userID, u.username, u.email, u.hashedPassword, u.salt, u.pointsMax
        FROM users u
        WHERE u.email = ?
        `

        db.get(query, [email], (err, row) => {
            if (err) reject(err);
            else {
                resolve(row);
            }
        })
    })
}

// aggiorna il punteggio, serve dopo una partita
export const updateHighestScore = (userID, score) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET pointsMax = ? 
        WHERE userID = ?
        `
        db.run(query, [score, userID], function (err) {
            if (err) reject(err);
            else {
                // 'this.changes' = righe modificate.
                // Se è 1, è un nuovo record
                // funziona solo con function(err)
                const hasBeatenRecord = this.changes > 0;
                resolve(hasBeatenRecord);
            }
        })
    })
}



