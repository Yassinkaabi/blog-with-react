import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation  } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function NavbarTest() {

    const navigate = useNavigate();
    
    const handleLogout = () => {
        // Supprimer token, isAuth du stockage local
        localStorage.removeItem('token');
        localStorage.removeItem('isAuth');
        // Rediriger vers la page de connexion
        navigate('/auth/login');
    };
    
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuth') || false;
        setIsAuthenticated(isAuth);
    }, [location]);

    return (
        <Navbar bg="light" data-bs-theme="light">
            <Container>
                <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link><Link to={'/blogs'}>Blog</Link></Nav.Link>
                    {!isAuthenticated ? (
                        <>
                            <Nav.Link><Link to={'auth/register'}>Register</Link></Nav.Link>
                            <Nav.Link><Link to={'auth/login'}>Log in</Link></Nav.Link>
                        </>
                    ) : (
                        <Nav.Link><button className='btn btn-danger' onClick={handleLogout}>Log out</button></Nav.Link>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
}

export default NavbarTest;