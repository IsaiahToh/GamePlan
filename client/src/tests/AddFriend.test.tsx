import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddFriend } from "../components/header/profile/AddFriend";
import "@testing-library/jest-dom";

import.meta.env.VITE_API_URL = "http://localhost:3000";

// Mock react-hot-toast to avoid errors
jest.mock("react-hot-toast", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn((key) => {
        if (key === "token") return "test-token";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
    status: 200,
  })
) as jest.Mock;

describe("AddFriend", () => {
  it("renders input and button after opening dialog", () => {
    render(<AddFriend />);
    // Open the dialog/modal
    fireEvent.click(screen.getByText(/add friends/i));
    // Now the input and button should be in the document
    expect(screen.getByPlaceholderText(/find an email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send friend request/i })
    ).toBeInTheDocument();
  });

  it("allows typing and submitting the form", async () => {
    render(<AddFriend />);
    fireEvent.click(screen.getByText(/add friends/i));
    fireEvent.change(screen.getByPlaceholderText(/find an email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /send friend request/i })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/friend"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );
    });
  });
});
