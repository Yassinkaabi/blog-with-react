import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VerifyEmail from './verifyEmail';

const Register = () => {
    const [info, setInfo] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [verificationLink, setVerificationLink] = useState('');

    const handleChange = (e) => {
        setInfo({
            ...info,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (info.password !== info.repeatPassword) {
                setErrors({ passwordMatch: 'Passwords do not match.' });
                return;
            }
            const response = await axios.post('http://localhost:5000/api/v1/auth/register', info);
            setMessage(response.data.message);
            setVerificationLink(response.data.data.verificationLink)
            navigate(`/verify-email/${verificationLink}`);
        } catch (error) {
            console.log(error);

            if (error.response && error.response.data && error.response.data.msg) {
                setErrors({ server: error.response.data.msg });
            } else {
                setErrors({ server: 'An error occurred. Please try again later.' });
            }
        }
    };

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuth') || 'false';
        if (isAuth === 'true') {
            navigate('/blogs');
        }
    }, []);

    return (
        <>
            <div className="container-bg">
                <div className="screen">
                    <div className="screen__content">
                        {/* {success ? (
                            <div>
                                <p>{message}</p>
                                <p>
                                    Click <Link to={verificationLink}>here</Link> to verify your email.
                                </p>
                            </div>
                        ) : ( */}
                        <form className="login" onSubmit={handleSubmit}>
                            <div className="login__field">
                                <i className="login__icon fas fa-user"></i>
                                <input type="text" className="login__input" placeholder="username" name="username" onChange={handleChange} />
                            </div>
                            <div className="login__field">
                                <i className="login__icon fas fa-user"></i>
                                <input type="email" className="login__input" placeholder="Email" name="email" onChange={handleChange} />
                            </div>
                            <div className="login__field">
                                <i className="login__icon fas fa-lock"></i>
                                <input type="password" className="login__input" placeholder="Password" name="password" onChange={handleChange} />
                            </div>
                            <div className="login__field">
                                <i className="login__icon fas fa-lock"></i>
                                <input type="password" className="login__input" placeholder="repeat password" name="repeatPassword" onChange={handleChange} />
                            </div>
                            {errors.passwordMatch && <p className="error">{errors.passwordMatch}</p>}

                            <button className="button login__submit">
                                <span className="button__text">SIGN In Now</span>
                                <i className="button__icon fas fa-chevron-right"></i>
                            </button>
                            {errors.server && <p className="error">{errors.server}</p>}
                        </form>
                        {/* )} */}
                        <div div className="social-login">
                            <h3>log in</h3>
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
            </div >

        </>
    );
};

export default Register;
