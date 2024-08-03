import React, { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationComponent from './Notification';
import ReceiveInvitation from './ReceiveInvitation';
import { MDBIcon } from 'mdb-react-ui-kit';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function NavbarTest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const userId = localStorage.getItem('userId');
    const socket = socketIO.connect('http://localhost:5000');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuth');
        localStorage.removeItem('userId');
        navigate('/auth/login');
    };

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuth') || false;
        setIsAuthenticated(isAuth);
    }, [location]);

    useEffect(() => {
        if (userId) {
            socket.emit('identify', userId);

            socket.on('message', (newMessage) => {
                if (newMessage.receiver === userId) {
                    setUnreadMessages(prevCount => prevCount + 1);
                    saveNotificationLocally(newMessage);
                }
            });

            fetchOfflineMessages(userId);
        }

        return () => {
            socket.off('message');
        };
    }, [userId]);

    const saveNotificationLocally = (message) => {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    };

    const fetchOfflineMessages = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/message/messages/${userId}`);
            const unread = response.data.filter(msg => !msg.seen).length;
            setUnreadMessages(unread);
            localStorage.setItem('messages', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching offline messages:', error);
        }
    };

    const handleNotificationClick = () => {
        setUnreadMessages(0);
        navigate('/chat');
        localStorage.setItem('messages', JSON.stringify([]));
    };

    return (
        <Navbar bg="light" data-bs-theme="light">
            <Container>
                <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link><Link to={'/blogs'}>Blog</Link></Nav.Link>
                    {!isAuthenticated ? (
                        <>
                            <Nav.Link><Link to={'auth/register'}>Register</Link></Nav.Link>
                            <Nav.Link><Link to={'auth/login'}>Log in </Link> </Nav.Link>
                        </>
                    ) : (
                        <Nav.Link><button className='btn btn-danger' onClick={handleLogout}>Log out</button></Nav.Link>
                    )}
                </Nav>
                {isAuthenticated &&
                    <Nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <NotificationComponent socket={socket} />
                        <ReceiveInvitation socket={socket} />
                        <Nav.Link onClick={handleNotificationClick} style={{ position: 'relative' }}>
                            <MDBIcon fas icon="envelope" socket={socket} />
                            {unreadMessages > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-10px',
                                    padding: '5px 10px',
                                    borderRadius: '50%',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    fontSize: '8px'
                                }}>
                                    {unreadMessages}
                                </span>
                            )}
                        </Nav.Link>
                    </Nav>
                }
            </Container>
        </Navbar>
    );
}

export default NavbarTest;
