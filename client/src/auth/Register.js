import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [info, setInfo] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

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
            console.log("response", response.data);
            if (response)
                navigate('/auth/login')
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data && error.response.data.msg) {
                setErrors({ server: error.response.data.msg });
            } else {
                setErrors({ server: 'An error occurred. Please try again later.' });
            }
        }
    };

    return (
        <>
            <div className='container mt-5'>
                <form onSubmit={handleSubmit}>
                    <label>Username</label>
                    <input type='text' placeholder='Enter your username' name="username" id="username"
                        onChange={handleChange} required />
                    <label>Email</label>
                    <input type='text' placeholder='Enter your email' name="email" id="email"
                        onChange={handleChange} required />
                    <label>Password</label>
                    <input type='password' placeholder='Enter your password' name="password" id="password"
                        onChange={handleChange} required />
                    <label>Repeat password</label>
                    <input type='password' placeholder='Repeat your password' name="repeatPassword" id="repeatPassword"
                        onChange={handleChange} required />
                    {errors.passwordMatch && <p className="error">{errors.passwordMatch}</p>}

                    <button className='btn-primary' type='submit'>Register</button>
                    {errors.server && <p className="error">{errors.server}</p>}
                </form>
            </div>
        </>
    );
};

export default Register;
