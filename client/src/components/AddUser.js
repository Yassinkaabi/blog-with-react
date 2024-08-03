import React, { useEffect, useState } from 'react';
import { Button, Modal, Tooltip, message } from 'antd';
import axios from 'axios';
import io from 'socket.io-client';
import { notification } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const socket = io("http://localhost:5000");

const AllUser = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const currentUser = localStorage.getItem('userId');

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        // Simple loading mock. You should add cleanup logic in real world.
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/auth/users");
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();

        // Listen for invitation received
        socket.on('invitationReceived', (data) => {
            notification.info({
                message: 'Invitation Received',
                description: `${data.senderName} sent you an invitation.`,
                placement: 'bottomRight'
            });
        });

        // Listen for invitation accepted
        socket.on('invitationAccepted', (data) => {
            notification.success({
                message: 'Invitation Accepted',
                description: `${data.userName} accepted your invitation.`,
                placement: 'bottomRight'
            });
        });

        return () => {
            socket.off('invitationReceived');
            socket.off('invitationAccepted');
        };
    }, []);

    const sendInvitation = async (receiverId) => {
        try {
            await axios.post("http://localhost:5000/api/v1/auth/send-invitation", {
                senderId: currentUser,
                receiverId
            });
            notification.success({
                message: 'Invitation Sent',
                description: 'Your invitation has been sent.',
                placement: 'bottomRight'
            });
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    return (
        <>
            <Tooltip title='find users'>
                <img
                    src='https://cdn-icons-png.flaticon.com/128/9512/9512769.png'
                    width={30}
                    onClick={showLoading}
                // style={{ cursor: 'pointer' }}
                />
            </Tooltip>
            <Modal
                title={<p>Find users</p>}
                footer={
                    <Button type="primary" onClick={showLoading}>
                        Reload
                    </Button>
                }
                loading={loading}
                open={open}
                onCancel={() => setOpen(false)}
            >
                <div className='container'>
                    {users.map((user, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img
                                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3LsvFHtFFF_2L8wet7mVDPW2DR0OZfAI2Rg&s'
                                width={40}
                            />
                            <h5>{user.username}</h5>
                            <Tooltip title='sent invitation'>
                                <FontAwesomeIcon icon={faPlus} cursor={'pointer'} color='green' onClick={() => sendInvitation(user._id)} />
                            </Tooltip>
                        </div>
                    ))}
                </div>
            </Modal >
        </>
    );
};

export default AllUser;
