'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState('otp'); // 'otp' | 'password'
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function goNext() {
    const next = params.get('next') || '/dashboard';
    router.replace(next);
    router.refresh();
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setStep('otp');
      setInfo(`Code envoyé à ${email}. Vérifiez vos e-mails.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Code incorrect');
      goNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function signInPassword(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Identifiants incorrects');
      goNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setStep('email');
    setCode('');
    setPassword('');
    setError('');
    setInfo('');
  }

  // --- Password mode ---------------------------------------------------
  if (mode === 'password') {
    return (
      <form onSubmit={signInPassword} className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Adresse e-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@exemple.com"
            className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
          />
        </label>
        <label className="block text-sm font-medium text-gray-300">
          Mot de passe
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
          />
        </label>
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 rounded-xl bg-[#FFCC00] text-black font-bold disabled:opacity-60 hover:scale-[1.01] transition"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        <button
          type="button"
          onClick={() => switchMode('otp')}
          className="w-full text-sm text-gray-400 hover:text-[#FFCC00] transition"
        >
          ← Se connecter avec un code à usage unique
        </button>
      </form>
    );
  }

  // --- OTP mode — email step ------------------------------------------
  if (step === 'email') {
    return (
      <form onSubmit={requestOtp} className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Adresse e-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
          />
        </label>
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl bg-[#FFCC00] text-black font-bold disabled:opacity-60 hover:scale-[1.01] transition"
        >
          {loading ? 'Envoi…' : 'Recevoir le code'}
        </button>
        <button
          type="button"
          onClick={() => switchMode('password')}
          className="w-full text-sm text-gray-400 hover:text-[#FFCC00] transition"
        >
          Accès admin — connexion par mot de passe
        </button>
      </form>
    );
  }

  // --- OTP mode — code step -------------------------------------------
  return (
    <form onSubmit={verifyOtp} className="space-y-4">
      {info ? <p className="text-sm text-gray-400">{info}</p> : null}
      <label className="block text-sm font-medium text-gray-300">
        Code à 6 chiffres
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition tracking-[0.35em] text-center text-lg font-mono"
        />
      </label>
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full py-3 rounded-xl bg-[#FFCC00] text-black font-bold disabled:opacity-60 hover:scale-[1.01] transition"
      >
        {loading ? 'Vérification…' : 'Se connecter'}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep('email');
          setCode('');
          setError('');
        }}
        className="w-full text-sm text-gray-400 hover:text-[#FFCC00] transition"
      >
        ← Utiliser un autre e-mail
      </button>
    </form>
  );
}
