"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Credenciales incorrectas");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-white/10 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4">Login Admin</h1>

        <input
          aria-label="Correo"
          type="email"
          autoComplete="username"
          required
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 bg-black/20 border border-white/10 rounded"
        />

        <input
          aria-label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-3 bg-black/20 border border-white/10 rounded"
        />

        {error && <p role="alert" className="text-red-400 text-sm mb-2">{error}</p>}

        <button disabled={loading} className="w-full bg-[var(--color-primary)] py-3 rounded font-bold disabled:opacity-50">
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
