// Login.js
import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { colors } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login Successful!');
                localStorage.setItem('token', data.token);
                
                // Redirect based on user role
                const { role } = JSON.parse(atob(data.token.split('.')[1]));
                if (role === 'admin') {
                    navigate('/admin-dashboard');
                } else if (role === 'consumer') {
                    navigate('/consumer-dashboard');
                } else if (role === 'grid_operator') {
                    navigate('/grid-operator-dashboard');
                } else {
                    alert('Invalid role!');
                }
            } else {
                alert(data.message || 'Invalid Credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h3>Login</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>

                <p  >
                   
                    Don't have an account? 
                  
                    <span 
                        className="signup-link" 
                        onClick={() => navigate('/signup')}
                    >
                        Sign up
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;
