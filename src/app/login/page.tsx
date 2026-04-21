"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button, Card, Input } from "@/components/ui";
import { authenticate, resolveRolePath } from "@/features/auth/service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const user = authenticate({ email, password });

    if (!user) {
      setError("Credenciais invalidas. Use um dos usuarios de demonstracao.");
      return;
    }

    router.push(resolveRolePath(user.role));
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
            Seu perfil e definido automaticamente pelo tipo de conta.
          </p>
        </div>

        <Card className="border-0 p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  E-mail ou Usuário
                </label>
                <Input
                  type="text"
                  placeholder="admin@ciso.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                />
              </div>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              <p className="font-semibold text-gray-800">
                Contas de demonstracao
              </p>
              <p>admin@ciso.com.br / 123456</p>
              <p>clinica@ciso.com.br / 123456</p>
              <p>medico@ciso.com.br / 123456</p>
              <p>profissional@ciso.com.br / 123456</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="h-12 w-full text-base"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
