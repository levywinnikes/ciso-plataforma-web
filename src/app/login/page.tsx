"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      setError("Credenciais inválidas. Verifique e-mail e senha.");
      return;
    }

    router.refresh();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7f6] p-4">
      <div className="w-full max-w-md space-y-8 duration-500 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <span className="text-2xl font-bold">CISO</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Acesso à Plataforma
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Seu perfil é definido automaticamente pelo tipo de conta.
          </p>
        </div>

        <Card className="border-0 p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="admin@ciso.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <Button
              type="submit"
              variant="primary"
              className="h-12 w-full text-base"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
