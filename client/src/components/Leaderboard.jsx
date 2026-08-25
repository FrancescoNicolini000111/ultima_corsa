import { useState, useEffect } from 'react'
import API from "../API/API.js"
import { Container, Table, Button } from "react-bootstrap";
import { Link } from "react-router"

export function Leaderboard() {

    const [leaderboard, setLeaderboard] = useState();
    const [error, setError] = useState("");

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const map = await API.getLeaderboard();
                setLeaderboard(map);
            } catch {
                setLeaderboard([]);
                setError("Impossibile caricare la classifica.");
            }
        }
        loadLeaderboard();
    }, []);


    return (
        <div className="d-flex  justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <Container className=" mt-4">
                <h2 className="mb-4">Classifica Top Players</h2>
                {error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Posizione</th>
                                <th>Giocatore</th>
                                <th>Punteggio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard?.map((entry, index) => (
                                <tr key={`${entry.username}-${entry.pointsMax}-${index}`}>
                                    <td>
                                        {index === 0 && <i className="bi bi-award-fill" style={{ color: 'gold', fontSize: '1.5rem' }}></i>}
                                        {index === 1 && <i className="bi bi-award-fill" style={{ color: 'silver', fontSize: '1.5rem' }}></i>}
                                        {index === 2 && <i className="bi bi-award-fill" style={{ color: '#cd7f32', fontSize: '1.5rem' }}></i>}
                                        {index > 2 && index + 1}
                                    </td>
                                    <td>{entry.username}</td>
                                    <td>{entry.pointsMax}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                <Container>
                    <Link to="/play/game">
                        <Button><i className="bi bi-arrow-left-short ms-1"></i> Indietro</Button>
                    </Link>
                </Container>
            </Container>
        </div>
    )



}