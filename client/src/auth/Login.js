import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [info, setInfo] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Soumettre les données du formulaire au serveur
    const handleChange = (e) => {
        setInfo({
            ...info,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/v1/auth/login', info);
            // console.log("response", response.data);
            if (response) {
                localStorage.setItem('token', response.data.result.token);// Enregistrer token dans le stockage local
                localStorage.setItem('isAuth', true) // Enregistrer isAuth dans le stockage local
                navigate('/blogs');
            } else {
                console.log('bad request');
            }
            return response;
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrors({ server: error.response.data.message });
            } else {
                setErrors({ server: 'An error occurred. Please try again later.' });
            }
        }
    };

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuth') || 'false'; // Assurez-vous de récupérer une chaîne de caractères
        if (isAuth === 'true') {
            navigate('/blogs');
        }
    }, []);

    return (
        <div className='container mt-5'>
            <h1>Login</h1>
            <form action="/login" method="post">
                <label htmlFor="email">Email: </label>
                <input type="text" name="email" id="email" onChange={handleChange} /><br />

                <label htmlFor='password'>Password: </label>
                <input type="password" name="password" id="password" onChange={handleChange} /><br />

                <button className='btn btn-primary' type="submit" onClick={handleSubmit}>Log in</button>
                {errors.server && <p className="error">{errors.server}</p>}
            </form>
        </div>
    );
};

export default Login;
