import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Button, Dropdown } from "react-bootstrap";

const socket = io("http://localhost:5000");

const ReceiveInvitation = () => {
    const [data, setData] = useState([]);
    const [showButtons, setShowButtons] = useState(false); // State to manage button visibility
    const [selectedNotification, setSelectedNotification] = useState(null); // State to manage selected notification
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchReceivedInvitations = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/auth/received-invitations/${userId}`);
                const receivedInvitations = response.data.map(invitation => ({
                    id: uuidv4(),
                    senderId: invitation.senderId,
                    message: `${invitation.senderName} sent you an invitation.`,
                    receivedTime: new Date().toLocaleTimeString()
                }));
                setData(receivedInvitations);
            } catch (error) {
                console.error('Error fetching received invitations:', error);
            }
        };

        fetchReceivedInvitations();

        // Listen for new invitation received
        socket.on('invitationReceived', (invitation) => {
            const newNotification = {
                id: uuidv4(),
                senderId: invitation.senderId,
                message: `${invitation.senderName} sent you an invitation.`,
                receivedTime: new Date().toLocaleTimeString()
            };
            setData((prevData) => [...prevData, newNotification]);
        });

        return () => {
            socket.off('invitationReceived');
        };
    }, [userId]);

    const acceptInvitation = async (senderId) => {
        try {
            await axios.post('http://localhost:5000/api/v1/auth/accept-invitation', {
                userId: userId,
                senderId
            });
            setData((prevData) => prevData.filter(invitation => invitation.senderId !== senderId));
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const declineInvitation = async (senderId) => {
        try {
            await axios.post('http://localhost:5000/api/v1/auth/decline-invitation', {
                userId: userId,
                senderId: senderId
            });
            setData((prevData) => prevData.filter(invitation => invitation.senderId !== senderId));
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    const toggleButtons = () => {
        setShowButtons(prevState => !prevState); // Toggle showButtons state
    };

    const handleDropdownClick = (notification) => {
        setSelectedNotification(notification);
        toggleButtons(); // Show buttons when clicking on dropdown item
    };

    return (
        <div className="App">

            {/* Dropdown to toggle button visibility */}
            <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {/* <Badge>
                        <img
                            src='https://cdn-icons-png.flaticon.com/128/2645/2645890.png'
                            width={20}
                            style={{ cursor: 'pointer' }}
                        />
                    </Badge> */}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {data.map(notification => (
                        <Dropdown.Item key={notification.id} onClick={() => handleDropdownClick(notification)}>
                            {notification.message}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            {/* Display buttons based on selected notification */}
            {selectedNotification && showButtons && (
                <div>
                    <Button variant="success" onClick={() => acceptInvitation(selectedNotification.senderId)}>Accept</Button>
                    <Button variant="danger" onClick={() => declineInvitation(selectedNotification.senderId)}>Decline</Button>
                </div>
            )}
        </div>
    );
};

export default ReceiveInvitation;
