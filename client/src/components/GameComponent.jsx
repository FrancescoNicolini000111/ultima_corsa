import { useState, useEffect, useRef, useCallback} from 'react'
import API from "../API/API.js"
import undergroundWithLines from "../assets/undergroundWithLines.png"
import undergroundWithoutLines from "../assets/undergroundWithoutLines.png"
import { Container, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from "react-router"

export function GameComponent({user, refreshUser}) {
    const [gamePhase, setGamePhase] = useState("SETUP")

    const [trainMap, setTrainMap] = useState([]);

    const [userTrip, setUserTrip] = useState([]);

    const [startStation, setStartStation] = useState();

    const [arriveStation, setArriveStation] = useState();

    const [timeLeft, setTimeLeft] = useState(90);

    const [result, setResult] = useState();

    const [currentIndex, setCurrentIndex] = useState(0);

    const [error, setError] = useState("");

    const STARTING_COINS = 20;

    const userTripRef = useRef(userTrip);

    const endGameInProgressRef = useRef(false);

    const shuffle = (array) => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };


    useEffect(() => {
        userTripRef.current = userTrip;
    }, [userTrip]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const loadTrainMap = async () => {
            try {
                const map = await API.getTrainMap();
                const shuffledMap = shuffle(map);
                setTrainMap(shuffledMap);
            } catch {
                setTrainMap([]);
                setError("Impossibile caricare la mappa della rete.");
            }
        }
        loadTrainMap();
    }, []);

    const handleStartGame = async () => {
        try {
            const stations = await API.startGame();
            setStartStation(stations.startStationName)
            setArriveStation(stations.arriveStationName);
            setError("");
            setGamePhase("PIANIFICAZIONE");
        } catch {
            setError("Impossibile avviare la partita.");
        }
    }


    const handleToggleRoute = (route) => {
        setUserTrip((prevTrip) => {
            const isSelected = prevTrip.includes(route);
            if (isSelected) {
                return prevTrip.filter(r => r !== route);
            } else {
                return [...prevTrip, route];
            }
        });
    }


    const handleEndGame = useCallback(async (userTrip) => {
        if (endGameInProgressRef.current) {
            return;
        }

        endGameInProgressRef.current = true;

        try {
            const result = await API.endGame(userTrip);
            setResult(result)
            setTimeLeft(90)

            if (result.isValid) {
                await refreshUser(); 
            }

            setGamePhase(result.isValid ? "ESECUZIONE" : "RISULTATO");
        } catch {
            setError("Impossibile completare la partita.");
            setGamePhase("SETUP");
        } finally {
            endGameInProgressRef.current = false;
        }
    },[refreshUser])

    //timer scelta tratte
    useEffect(() => {
        if (gamePhase !== "PIANIFICAZIONE") return;

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    handleEndGame(userTripRef.current);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Pulizia del timer
        return () => clearInterval(timerId);
    }, [gamePhase, handleEndGame]);

    
    //timer eventi
    useEffect(() => {
        if (gamePhase !== "ESECUZIONE" || !result) return;

        const timerId = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                if (prevIndex >= userTrip.length - 1) {
                    setGamePhase("RISULTATO");
                    setCurrentIndex(0);
                    setUserTrip([]);
                    return prevIndex;
                }
                return prevIndex + 1;
            });
        }, 3500);

        return () => clearInterval(timerId);
    }, [gamePhase, result, userTrip.length]);

    const runningTotal = result ? STARTING_COINS + result.eventsFound
        .slice(0, currentIndex + 1)
        .reduce((sum, event) => sum + event.points, 0) : STARTING_COINS;



    return (

        <Container style={{ minHeight: 'calc(100vh - 56px)' }}>
            {gamePhase === "SETUP" &&
                < Row className="align-items-center h-100 mt-4">
                    <Col md={7}>

                        <div className="border rounded-4 shadow p-3 bg-white">
                            <img src={undergroundWithLines} alt="Mappa della rete" style={{ width: '100%', height: 'auto' }} />
                        </div>

                    </Col>
                    <Col md={5} className="text-center d-flex flex-column gap-2">
                        <p className="text-muted mb-4 fs-5"> Bentornato <strong>{user?.username}</strong>.<br />Il tuo record è <strong>{user?.pointsMax} monete</strong>, sei pronto a batterlo?<br />Studia la mappa prima di iniziare. Quando sei pronto, premi Inizia.</p>
                        {error && <div className="alert alert-warning text-start">{error}</div>}

                        <Button size="lg" variant="primary" className="px-5 fw-semibold"
                            onClick={() => {
                                handleStartGame();
                                setTimeLeft(90);
                                setUserTrip([]);
                                setCurrentIndex(0);
                                setResult();
                            }}>
                            Inizia <i className="bi bi-arrow-right-short ms-1"></i>
                        </Button>
                        <Link to="/leaderboard">
                            <Button>
                                <i className="bi bi-trophy"></i> Classifica
                            </Button>
                        </Link>
                    </Col>
                </Row>
            }


            {gamePhase === "PIANIFICAZIONE" &&
                <Row className="align-items-start h-100 mt-4">
                    <Col md={6}>


                        <div className="mb-3 p-2 bg-white rounded-3 shadow-sm">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Partenza</small>
                                    <strong className="fs-6 text-success">
                                        <i className="bi bi-geo-alt-fill me-1"></i>{startStation}
                                    </strong>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Arrivo</small>
                                    <strong className="fs-6 text-danger">
                                        <i className="bi bi-flag-fill me-1"></i>{arriveStation}
                                    </strong>
                                </div>
                            </div>
                        </div>


                        <div className="border rounded-4 shadow p-3 bg-white">
                            <img src={undergroundWithoutLines} alt="Mappa della rete" style={{ width: '100%', height: 'auto' }} />
                        </div>
                    </Col>
                    <Col md={5}>

                        <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {trainMap.map((route, index) => (
                                <Form.Check
                                    key={index}
                                    type="checkbox"
                                    label={`${route.station1Name} <—> ${route.station2Name}`}
                                    checked={userTrip.includes(route)}
                                    onChange={() => handleToggleRoute(route)}
                                />
                            ))}
                        </div>


                        <div className="border rounded-3 p-3 bg-light shadow-sm">
                            <h6 className="fw-bold mb-2 text-muted text-uppercase small">
                                <i className="bi bi-geo-fill me-1 text-primary"></i> Tratte Scelte
                            </h6>

                            {userTrip.length === 0 ? (
                                <p className="text-muted small mb-0">Nessuna tratta selezionata. Inizia a pianificare!</p>
                            ) : (
                                <div className="d-flex flex-wrap align-items-center gap-1">
                                    {userTrip.map((r, idx) => (
                                        <span key={idx} className="d-flex align-items-center">
                                            <span
                                                className="badge bg-white text-dark border p-2 shadow-sm">
                                                <span className="fw-semibold">{r.station1Name}</span>
                                                <i> {"<->"} </i>
                                                <span className="fw-semibold">{r.station2Name}</span>
                                            </span>

                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="d-flex flex-column mt-2 align-items-start">
                            <span className="fw-bold fs-1 text-danger">{timeLeft}</span>
                        </div>
                        <div className="d-flex flex-column mt-3 align-items-end">
                            <Button
                                disabled={userTrip.length === 0}
                                aria-disabled={userTrip.length === 0}
                                onClick={() => {
                                    handleEndGame(userTrip)
                                }}> Conferma </Button>

                        </div>
                    </Col>
                </Row>
            }



            {gamePhase === "ESECUZIONE" && result && (
                <Row className="mt-4">
                    <div className="card p-3 shadow-sm">
                        <h3>Viaggio in corso... ({currentIndex + 1} / {userTrip.length})</h3>

                        <div className="mt-3">
                            <p><strong>Tratta:</strong> {userTrip[currentIndex].station1Name} - {userTrip[currentIndex].station2Name}</p>

                            {result.eventsFound[currentIndex] && (
                                <div className="alert alert-info">
                                    <strong>Evento:</strong> {result.eventsFound[currentIndex].eventDescription} <br />
                                    <strong>Effetto: </strong>
                                    {result.eventsFound[currentIndex].points > 0 ? "+" : ""}
                                    {result.eventsFound[currentIndex].points}<br />
                                    <strong>Punteggio corrente:</strong> {runningTotal}
                                </div>
                            )
                            }
                        </div>
                    </div>
                </Row>
            )}




            {gamePhase === "RISULTATO" &&
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
                    {result && result.isValid ? (
                        <Row className="justify-content-center align-items-center w-100">
                            <Col md={8}>
                                <div className="bg-white border-0 rounded-4 p-4 p-sm-5 shadow">
                                    <h4>Partita terminata.</h4>
                                    <h4>Complimenti, il tuo punteggio finale è:</h4>
                                    <h4><strong>{result.finalPoints > 0 ? result.finalPoints : 0} monete</strong></h4>
                                </div>
                                <Button className="mt-5" onClick={() => {
                                    setGamePhase("SETUP");
                                    setResult()
                                    setCurrentIndex(0);
                                    setUserTrip([]);
                                }}>
                                    <i className="bi bi-arrow-left-short ms-1"></i> Torna alla fase di setup
                                </Button>
                            </Col>
                        </Row>
                    ) :
                        (
                            <Row className="justify-content-center align-items-center w-100">
                                <Col md={8}>
                                    <div className="bg-white border-0 rounded-4 p-4 p-sm-5 shadow text-danger">
                                        <h4>Partita terminata, percorso non valido.</h4>
                                        <h4>Il tuo punteggio finale è:</h4>
                                        <h4><strong>0 monete</strong></h4>
                                    </div>
                                    <Button className="mt-5" onClick={() => {
                                        setGamePhase("SETUP");
                                        setResult()
                                        setCurrentIndex(0);
                                        setUserTrip([]);
                                    }}>
                                        <i className="bi bi-arrow-left-short ms-1"></i> Torna alla fase di setup
                                    </Button>
                                </Col>
                            </Row>
                        )
                    }
                </div>

            }

        </Container >
    )
}