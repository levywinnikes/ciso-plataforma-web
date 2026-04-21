"use client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import LoginPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  });
});

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(
      screen.getByPlaceholderText("admin@ciso.com.br"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("shows error message on invalid credentials", async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: "CredentialsSignin",
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("admin@ciso.com.br"), {
      target: { value: "wrong@ciso.com.br" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });

  it("redirects to / on successful login", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("admin@ciso.com.br"), {
      target: { value: "admin@ciso.com.br" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows loading state while submitting", async () => {
    (signIn as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)),
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("admin@ciso.com.br"), {
      target: { value: "admin@ciso.com.br" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(screen.getByRole("button", { name: /entrando/i })).toBeDisabled();
  });

  it("calls signIn with trimmed lowercase email", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("admin@ciso.com.br"), {
      target: { value: "  ADMIN@CISO.COM.BR  " },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          email: "admin@ciso.com.br",
          redirect: false,
        }),
      );
    });
  });
});
