import React from 'react'
import { Link } from 'react-router-dom'

const verificationSuccess = () => {
    return (
        <h3 className='container mt-5'>
            Email verified successfully! <Link to={'/auth/login'}>Login in</Link>
        </h3>
    )
}

export default verificationSuccess