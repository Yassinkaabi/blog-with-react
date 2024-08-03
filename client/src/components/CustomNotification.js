import React from 'react';
import { Button } from 'react-bootstrap';

const CustomNotification = ({ notification, onAccept, onDecline }) => {
    return (
        <div className="notification">
            <p>{notification.message}</p>
            <small>{notification.receivedTime}</small>
            <div>
                <Button variant="success" onClick={() => onAccept(notification.senderId)}>Accept</Button>
                <Button variant="danger" onClick={() => onDecline(notification.senderId)}>Decline</Button>
            </div>
        </div>
    );
};

export default CustomNotification;
