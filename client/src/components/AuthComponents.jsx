import { useState } from "react";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

export function LoginForm(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault(); // evita il ricaricamento completo della pagina, che azzererebbe lo stato
        // e interromperebbe javascript
        const credentials = { email, password };
        await props.handleLogin(credentials);
    }

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>

            <Row className="justify-content-center align-items-center w-100">
                <Col md={5}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">
                            <i className="bi bi-train-front-fill me-2"></i>Ultima Corsa
                        </h2>
                    </div>
                    <div className="bg-white border-0 rounded-4 p-4 p-sm-5 shadow">
                        <h4 className="fw-bold mb-4 text-dark text-center">Accedi al Sistema</h4>

                        {props.message &&
                            <div className="p-3 mb-3 bg-danger-subtle text-danger border border-danger rounded">
                                {props.message.msg}
                            </div>}

                        <Form onSubmit={handleSubmit}>

                            <Form.Group controlId="email" className="mb-3">
                                <Form.Label className="text-muted small fw-semibold">Indirizzo Email</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <i className="bi bi-envelope text-muted"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        autoComplete="email"
                                        placeholder="nome@esempio.com"
                                        className="bg-light border-start-0"
                                        required
                                        value={email}
                                        onChange={(ev) => setEmail(ev.target.value)}
                                    />
                                </InputGroup>
                            </Form.Group>


                            <Form.Group controlId="password" className="mb-4">
                                <Form.Label className="text-muted small fw-semibold">Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <i className="bi bi-lock text-muted"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Inserisci password"
                                        className="bg-light border-start-0"
                                        required
                                        value={password}
                                        onChange={(ev) => setPassword(ev.target.value)}
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100 py-2 fw-semibold rounded-3 shadow-sm">
                                Entra <i className="bi bi-arrow-right-short ms-1"></i>
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>

        </div>
    )
}
export function LogoutButton(props) {
    return (
        <Button onClick={() => props.handleLogout()}><i className="bi bi-box-arrow-left"></i> Logout</Button>
    )
}