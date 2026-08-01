import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ShieldAlert, Fingerprint } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsmLoading, setIsUsmLoading] = useState(false);
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

  const handleUsmLogin = async () => {
    setIsUsmLoading(true);
    setError("");
    
    try {
      // O USM não requer senha. Ele lê a sessão da máquina/rede da Sony.
      // O backend simula isso lendo um Header ou injetando o usuário de desenvolvimento.
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/usm-login`,
        {},
        { withCredentials: true }
      );
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Falha na autenticação via USM.");
    } finally {
      setIsUsmLoading(false);
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
          <p style={{ color: 'var(--sony-gray-400)', fontSize: '13px' }}>Acesso restrito à rede corporativa</p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid var(--sony-red)', borderRadius: '8px', color: 'var(--sony-red)', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <Button 
            type="button" 
            onClick={handleUsmLogin}
            disabled={isUsmLoading || isLoading}
            style={{ 
              width: '100%',
              background: 'linear-gradient(90deg, #E50914, #B20710)', 
              color: 'white', 
              border: 'none', 
              height: '48px',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 0 15px rgba(229,9,20,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Fingerprint size={18} />
            {isUsmLoading ? 'Autenticando...' : 'Login via USM (SSO)'}
          </Button>
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--sony-gray-500)' }}>
            * Reconhecimento automático de sessão (Developer Bypass)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--sony-gray-500)', fontWeight: '600' }}>OU ACESSO EXTERNO</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--sony-gray-300)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              E-mail Corporativo
            </label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@sonymusic.com"
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

          <Button 
            type="submit" 
            disabled={isLoading || isUsmLoading}
            variant="outline"
            style={{ 
              color: 'var(--pure-white)', 
              borderColor: 'rgba(255,255,255,0.2)', 
              background: 'rgba(255,255,255,0.05)',
              marginTop: '8px',
              height: '44px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isLoading ? 'Entrando...' : 'Login com Senha'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
