import React from 'react'
import { navbarStyles } from '../assets/dummyStyles'
import img1 from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ user: propUser, onLogout }) => {
    const navigate = useNavigate();
    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/*logo */}
                <div onClick={() => navigate('/')} className={navbarStyles.logoContainer}>

                </div>

            </div>

        </header>
    )
}

export default Navbar
