import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Email ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 0%, #1a0505 0%, var(--sony-black) 60%, var(--sony-black) 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(20, 20, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="sony-icon" style={{ width: '60px', margin: '0 auto 16px', background: 'white', padding: '8px', borderRadius: '12px' }}>
            <img src="https://customer-assets-jai6qajn.emergentagent.net/job_84a5e55c-26a8-4190-b713-50bfc83fd45d/artifacts/ql8q4vna_Sony_Music_Logo.png" alt="Sony Music" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Sony Music PMO</h1>
          <p style={{ color: 'var(--sony-gray-400)', fontSize: '14px' }}>Faça login para acessar o painel executivo</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--sony-gray-300)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              E-mail Corporativo
            </label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pablo.duarte@sonymusic.com"
              required
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', color: 'var(--sony-gray-300)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Senha
            </label>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid var(--sony-red)', borderRadius: '8px', color: 'var(--sony-red)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              background: 'var(--sony-red)', 
              color: 'white', 
              border: 'none', 
              marginTop: '8px',
              height: '44px',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 0 15px rgba(229,9,20,0.4)'
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar na Plataforma'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
