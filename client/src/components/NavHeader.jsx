import { Navbar, Modal, Container, Button } from 'react-bootstrap';
import { useState } from "react"
import 'bootstrap-icons/font/bootstrap-icons.css';
import { LogoutButton } from "./AuthComponents.jsx";



export function NavHeader(props) {
    const [showRules, setShowRules] = useState(false);


    return (
        <Navbar bg="primary" data-bs-theme="dark" className="position-relative">
            <Container fluid>

                <div className="d-flex gap-2">
                    <Button onClick={() => setShowRules(!showRules)}>
                        <i className="bi bi-book"> Regolamento</i>
                    </Button>

                </div>


                <div className="position-absolute start-50 translate-middle-x">
                    {props.loggedIn && (
                        <h3 className="fw-bold mb-0 text-white">
                            <i className="bi bi-train-front-fill me-2"></i>Ultima Corsa
                        </h3>
                    )}
                </div>


                <div className="d-flex">
                    {props.loggedIn && (
                        <LogoutButton handleLogout={props.handleLogout} />
                    )}
                </div>
            </Container>

            <Modal show={showRules} onHide={() => setShowRules(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Regole del gioco</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6><i className="bi bi-bullseye"></i> Obiettivo</h6>
                    <p>Raggiungi la stazione di arrivo con il maggior numero di monete possibile. Parti con 20 monete. <br /><strong>Le tratte sono bidirezionali</strong>, perciò percorribili in entrambi i sensi.</p>

                    <h6 className="mt-3"><i className="bi bi-journal-text"></i> Fasi di gioco</h6>
                    <ol>
                        <li><strong>Setup</strong> — Studia la mappa completa della rete.</li>
                        <li><strong>Pianificazione (90s)</strong> — Ti vengono date 2 stazioni casuali, una di partenza e una di arrivo: costruisci il tuo percorso, da quella di inizio a quella di arrivo, selezionando le tratte corrette in sequenza, ma attento al limite di tempo.</li>
                        <li><strong>Esecuzione</strong> — Il tuo viaggio comincia e ad ogni tratta avverranno eventi, sia piacevoli che spiacevoli che potranno dare o togliere monete.</li>
                        <li><strong>Risultato</strong> — Ti viene mostrato il tuo punteggio finale.</li>
                    </ol>
                </Modal.Body>
            </Modal>
        </Navbar>
    );


}