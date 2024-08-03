import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    // const { token } = useParams();
    // const [message, setMessage] = useState('');
    // const navigate = useNavigate();

    // // useEffect(() => {
    // //     const verifyEmail = async () => {
    // //         try {
    // //             const response = await axios.get(`/api/v1/auth/verify/${token}`);
    // //             const authToken = response.data.authToken; // Assuming backend sends back authToken
    // //             setMessage(response.data.message);

    // //             // Store authToken in localStorage or sessionStorage
    // //             localStorage.setItem('authToken', authToken); // Example: Store in localStorage

    // //             // Redirect to home page or dashboard after successful verification
    // //             navigate('/');

    // //         } catch (error) {
    // //             setMessage(error.response.data.message);
    // //         }
    // //     };

    // //     verifyEmail();
    // // }, [token, navigate]);

    return (
        <div className='container mt-5'>
            <h2>Please check your email to confirm your registration</h2>
            {/* <p>{message}</p> */}
        </div>
    );
};

export default VerifyEmail;
