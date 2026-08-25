import { Route } from "../models.js"
const SERVER_URL = "http://localhost:3001"

// login 
const login = async (email, password) => {
    const response = await fetch(`${SERVER_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    })
    if (response.ok) {
        const loginJson = await response.json()
        return loginJson
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}

// get sessione
const getSession = async () => {
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
        method: 'GET',
        credentials: 'include'
    })
    if (response.ok) {
        const userJson = await response.json()
        return userJson
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}

// logout 
const logout = async () => {
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
        method: 'DELETE',
        credentials: 'include'
    })
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}


// get trainmmap
const getTrainMap = async () => {
    const response = await fetch(`${SERVER_URL}/api/trainmap`, {
        method: 'GET',
        credentials: 'include'
    })
    if (response.ok) {
        const trainmapJson = await response.json()
        return trainmapJson.map(t => new Route(
            t.station1Name,
            t.station2Name,
            t.lineColour
        )
        )
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}

// get leaderboard
const getLeaderboard = async () => {
    const response = await fetch(`${SERVER_URL}/api/leaderboard`, {
        method: 'GET',
        credentials: 'include'
    })
    if (response.ok) {
        const leaderboardJson = await response.json()
        return leaderboardJson.map(l =>
        (
            {
                "username": l.username,
                "pointsMax": l.pointsMax
            }
        )
        )
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}


const startGame = async () => {
    const response = await fetch(`${SERVER_URL}/api/games/start`, {
        method: 'POST',
        credentials: 'include'
    })
    if (response.ok) {
        const stationsJson = await response.json()
        return stationsJson
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}

const endGame = async (userTrip) => {
    const response = await fetch(`${SERVER_URL}/api/games/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userTrip)
    })
    if (response.ok) {
        const finalResultJson = await response.json()
        return finalResultJson
    }
    else {
        const text = await response.text()
        throw new Error(`Request failed ${response.status}: ${text}`)
    }
}

const API = { login, getSession, logout, getTrainMap, getLeaderboard, startGame, endGame }
export default API