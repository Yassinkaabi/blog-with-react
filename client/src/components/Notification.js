import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { notification, Badge, Button } from 'antd';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        const socket = io.connect('http://localhost:5000'); // Adjust the URL to your server

        socket.on('notification', (newNotification) => {
            console.log("Received notification:", newNotification);

            if (!newNotification.userId) {
                console.error('Notification missing userId:', newNotification);
                return;
            }

            setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
            showNotification(newNotification);
        });

        // console.log("user id :", userId);

        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/blog/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        return () => {
            socket.disconnect();
        };
    }, []);

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/blog/notifications/${id}`);
            setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification._id !== id));
            api.destroy()
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markNotificationAsSeen = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/blog/notifications/seen/${id}`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification._id === id ? { ...notification, seen: true } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notifications as seen:', error);
        }
    };

    const showNotification = async (newNotification) => {
        const backgroundColor = newNotification.seen ? 'white' : '#e9ecef';

        // Fetch user information
        try {

            api.open({
                message: `Notification from ${newNotification.username}`,
                description: (
                    <div style={{ cursor: 'pointer' }} onClick={() => markNotificationAsSeen(newNotification._id)}>
                        {`${newNotification.message} at ${new Date(newNotification.createdAt).toLocaleString()}`}
                    </div>
                ),
                duration: 2,
                style: { backgroundColor },
                btn: (
                    <Button onClick={() => deleteNotification(newNotification._id)}>
                        Delete
                    </Button>
                ),
            });
        } catch (error) {
            console.error('Error fetching user information:', error);
        }
    };


    const openAllNotifications = () => {
        notifications.slice().reverse().forEach((notification) => {
            showNotification(notification);
        });
    };

    const unseenCount = notifications.filter((notification) => !notification.seen).length;

    return (
        <div>
            {contextHolder}
            <Badge count={unseenCount} overflowCount={99}>
                <img
                    src='https://cdn-icons-png.flaticon.com/128/2645/2645890.png'
                    width={20}
                    onClick={openAllNotifications}
                    style={{ cursor: 'pointer' }}
                />
            </Badge>
        </div>
    );
};

export default NotificationComponent;
