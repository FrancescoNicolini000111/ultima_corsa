import { getTrainMap } from "./dao.js";

// POST /api/game/start
// qua è presente la logica della funzione di start
// non è nel dao perché l'unico accesso al db è con la preesistente funzione getTrainMap

const buildGraph = (routes) => {
    const graph = {};
    for (const r of routes) {
        graph[r.station1Name] = graph[r.station1Name] || [];
        graph[r.station2Name] = graph[r.station2Name] || [];
        graph[r.station1Name].push(r.station2Name);
        graph[r.station2Name].push(r.station1Name);
    }
    return graph;
}

const bfs = (graph, start, arrive) => {
    const queue = [{ "station": start, "distance": 0 }];
    const visited = [start];
    while (queue.length > 0) {
        const current = queue[0];
        const nearStations = graph[current.station] || [];
        queue.shift();
        if (current.station === arrive) {
            return current.distance;
        }
        nearStations.forEach(s => {
            if (!visited.includes(s)) {
                queue.push({ "station": s, "distance": current.distance + 1 })
                visited.push(s)
            }
        });
    }
    return Infinity;
}

export const getRandomPair = async () => {
    const routes = await getTrainMap();
    const graph = buildGraph(routes)
    const stations = Object.keys(graph)
    let dist = 0
    let startStation, arriveStation

    while (dist < 3) {
        const randomIndex1 = Math.floor(Math.random() * stations.length)
        const randomIndex2 = Math.floor(Math.random() * stations.length)
        startStation = stations[randomIndex1]
        arriveStation = stations[randomIndex2]
        dist = bfs(graph, startStation, arriveStation)
    }
    return { "startStationName": startStation, "arriveStationName": arriveStation }
}