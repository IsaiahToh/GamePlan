import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import "@testing-library/jest-dom";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock useDashboardContext
jest.mock("../context/DashboardContext", () => ({
  useDashboardContext: () => ({
    setLoggedIn: jest.fn(),
  }),
}));

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch for login
beforeEach(() => {
  globalThis.fetch = jest.fn((url, _) => {
    if (url?.toString().includes("/api/auth/login")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ token: "test-token" }),
      });
    }
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  }) as jest.Mock;
});

describe("Login", () => {
  it("renders login form fields", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("submits form and logs in successfully", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "me@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            email: "me@email.com",
            password: "password123",
          }),
        })
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith("token", "test-token");
      expect(window.localStorage.setItem).toHaveBeenCalledWith("email", "me@email.com");
    });
  });
});