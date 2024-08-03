import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBIcon,
    MDBTypography,
    MDBBadge,
    MDBInputGroup,
} from "mdb-react-ui-kit";
import SentInvitation from "./AddUser";
import { Link } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [msgByFriends, setMsgByFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const currentUserId = localStorage.getItem('userId');

    const fetchUserByMessage = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/message/user-by-message/${currentUserId}`);
            const updatedFriends = response.data.friends.map(friend => {
                const lastMessage = getLastMessage(friend.id);
                return {
                    ...friend,
                    lastMessageTime: lastMessage ? new Date(lastMessage.createdAt) : new Date(0) // Initialize to a very early date if no messages
                };
            }).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
            setFriends(updatedFriends);
            setMsgByFriends(response.data.messages);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchUserByMessage();
    }, [currentUserId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedFriend) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/message/messages/${currentUserId}/${selectedFriend.id}`);
                    setMessages(response.data);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            }
        };

        fetchMessages();
    }, [selectedFriend, currentUserId]);

    useEffect(() => {
        socket.on('message', (newMessage) => {
            if (
                (newMessage.sender === currentUserId && newMessage.receiver === selectedFriend.id) ||
                (newMessage.sender === selectedFriend.id && newMessage.receiver === currentUserId)
            ) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                incrementUnreadCount(newMessage.sender);
                updateFriendsList(newMessage.sender);
            }
        });
        scrollToBottom();

        return () => {
            socket.off('message');
        };
    }, [selectedFriend, currentUserId, messages]);

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    const messagesEndRef = useRef();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!selectedFriend) {
            console.error("No friend selected");
            return;
        }

        const response = await axios.post('http://localhost:5000/api/message/send-message', {
            senderId: currentUserId,
            receiverId: selectedFriend.id,
            content: message
        });

        const newMessage = response.data;
        socket.emit('message', newMessage);
        setMessage("");
        fetchUserByMessage(); // Fetch the latest messages after sending a message
        scrollToBottom(); // Scroll to bottom when a new message is sent
    };

    const getLastMessage = (friendId) => {
        const lastMessage = msgByFriends
            .filter(msg => (msg.sender.id === friendId || msg.receiver.id === friendId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return lastMessage ? lastMessage : null;
    };

    const unreadMessageCount = (friendId) => {
        return messages.filter(msg => msg.sender === friendId && msg.receiver === currentUserId && !msg.seen).length;
    };

    const incrementUnreadCount = (friendId) => {
        const updatedFriends = friends.map(friend => {
            if (friend.id === friendId) {
                return { ...friend, unreadCount: (friend.unreadCount || 0) + 1 };
            }
            return friend;
        });
        setFriends(updatedFriends);
    };

    const updateFriendsList = (friendId) => {
        const updatedFriends = friends.map(friend => {
            if (friend.id === friendId) {
                return { ...friend, lastMessageTime: new Date() }; // Update last message time for the selected friend
            }
            return friend;
        }).sort((a, b) => b.lastMessageTime - a.lastMessageTime); // Sort friends by last message time
        setFriends(updatedFriends);
    };

    return (
        <MDBContainer fluid className="py-5" style={{ backgroundColor: "#CDC4F9" }}>
            <MDBRow>
                <MDBCol md="12">
                    <MDBCard id="chat3" style={{ borderRadius: "15px" }}>
                        <MDBCardBody>
                            <MDBRow>
                                <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
                                    <div className="p-3">
                                        <div style={{ position: 'relative', left: '40', top: '0px' }}>
                                            <SentInvitation />
                                        </div>
                                        <MDBInputGroup className="rounded mb-3">
                                            {/* <input
                                                className="form-control rounded"
                                                placeholder="Search"
                                                type="search"
                                            />
                                            <span
                                                className="input-group-text border-0"
                                                id="search-addon"
                                            >
                                                <MDBIcon fas icon="search" />
                                            </span> */}
                                        </MDBInputGroup>

                                        <div style={{ position: "relative", height: "400px", overflowY: "auto" }}>
                                            <MDBTypography listUnStyled className="mb-0">
                                                {Array.isArray(friends) && friends.map((friend) => {
                                                    const lastMessage = getLastMessage(friend.id);
                                                    const unreadCount = friend.unreadCount || 0;
                                                    return (
                                                        <li key={friend.id} className="p-2 border-bottom" onClick={() => setSelectedFriend(friend)}>
                                                            <p className="d-flex justify-content-between" style={{ cursor: 'pointer' }}>
                                                                <div className="d-flex flex-row">
                                                                    <div>
                                                                        <img
                                                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                                                            alt="avatar"
                                                                            className="d-flex align-self-center me-3"
                                                                            width="60"
                                                                        />
                                                                        {unreadCount > 0 && (
                                                                            <MDBBadge pill color="danger" className="ms-2">
                                                                                {unreadCount}
                                                                            </MDBBadge>
                                                                        )}
                                                                    </div>
                                                                    <div className="pt-1">
                                                                        <p className="fw-bold mb-0">{friend.username}</p>
                                                                        <p className="small text-muted">{lastMessage ? lastMessage.content : "No messages yet"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="pt-1">
                                                                    {lastMessage && (
                                                                        <p className="small text-muted mb-1">
                                                                            {new Date(lastMessage.createdAt).toLocaleTimeString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </p>
                                                        </li>
                                                    );
                                                })}
                                            </MDBTypography>
                                        </div>
                                    </div>
                                </MDBCol>
                                <MDBCol md="6" lg="7" xl="8">
                                    <div style={{ position: "relative", height: "400px", overflowY: "auto" }}>
                                        {messages.map((msg, index) => (
                                            <div key={index} className={msg.sender === currentUserId ? "d-flex flex-row justify-content-end" : "d-flex flex-row justify-content-start"}>
                                                <img
                                                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                                    alt="avatar 1"
                                                    style={{ width: "45px", height: "100%" }}
                                                />
                                                <div>
                                                    <p
                                                        className="small p-2 ms-3 mb-1 rounded-3"
                                                        style={{ backgroundColor: "#f5f6f7" }}
                                                    >
                                                        {msg.content}
                                                    </p>
                                                    <p className="small ms-3 mb-3 rounded-3 text-muted float-end">
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="text-muted d-flex justify-content-start align-items-center pe-3 pt-3 mt-2">
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                            alt="avatar 3"
                                            style={{ width: "40px", height: "100%" }}
                                        />
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="exampleFormControlInput2"
                                            placeholder="Type message"
                                            value={message}
                                            onChange={handleChange}
                                        />
                                        <Link className="ms-1 text-muted" href="#!">
                                            <MDBIcon fas icon="paperclip" />
                                        </Link>
                                        <Link className="ms-3 text-muted" href="#!">
                                            <MDBIcon fas icon="smile" />
                                        </Link>
                                        <Link className="ms-3" href="#!" onClick={sendMessage}>
                                            <MDBIcon fas icon="paper-plane" />
                                        </Link>
                                    </div>
                                </MDBCol>
                            </MDBRow>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}
