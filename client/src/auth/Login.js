import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Login.css"

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
            if (response && response.data.result.isVerified) {
                localStorage.setItem('token', response.data.result.token);// Enregistrer token dans le stockage local
                localStorage.setItem('isAuth', true) // Enregistrer isAuth dans le stockage local
                localStorage.setItem('userId', response.data.result.userId) // Enregistrer isAuth dans le stockage local
                navigate('/blogs');
            } else {
                navigate('/verify-email');
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
    }, [navigate]);

    return (
        <>
            <div className="container-bg">
                <div className="screen">
                    <div className="screen__content">
                        <form className="login" onSubmit={handleSubmit}>
                            <div className="login__field">
                                <i className="login__icon fas fa-user"></i>
                                <input type="email" className="login__input" placeholder="Email" name="email" onChange={handleChange} />
                            </div>
                            <div className="login__field">
                                <i className="login__icon fas fa-lock"></i>
                                <input type="password" className="login__input" placeholder="Password" name="password" onChange={handleChange} />
                            </div>
                            <button className="button login__submit">
                                <span className="button__text">Log In Now</span>
                                <i className="button__icon fas fa-chevron-right"></i>
                            </button>
                            {errors.server && <p className="error">{errors.server}</p>}
                        </form>
                        <div className="social-login">
                            <h3>log in via</h3>
                            <div className="social-icons">
                                <Link to={""} className="social-login__icon fab fa-instagram"></Link>
                                <Link to={""} className="social-login__icon fab fa-facebook"></Link>
                                <Link to={""} className="social-login__icon fab fa-twitter"></Link>
                            </div>
                        </div>
                    </div>
                    <div className="screen__background">
                        {/* <span className="screen__background__shape screen__background__shape4"></span> */}
                        <span className="screen__background__shape screen__background__shape3"></span>
                        <span className="screen__background__shape screen__background__shape2"></span>
                        <span className="screen__background__shape screen__background__shape1"></span>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Login;
