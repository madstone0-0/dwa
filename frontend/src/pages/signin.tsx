import React, { useState } from 'react';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Signin details:', { email, password });
       
    };

    return (
        <div>
            <h2>Signin</h2>
            <form onSubmit={handleSignin}>
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
                <button type="submit">Signin</button>
            </form>
        </div>
    );
}

export default Signin;