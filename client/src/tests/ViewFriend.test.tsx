import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ViewFriend } from "../components/header/profile/ViewFriend";
import { DashboardProvider } from "../context/DashboardContext";
import "@testing-library/jest-dom";

// Set up environment variable for API URL
process.env.VITE_API_URL = "http://localhost:3000";

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
        if (key === "email") return "me@email.com";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch for friends and requests
beforeEach(() => {
  globalThis.fetch = jest.fn((url) => {
    if (url?.toString().includes("type=received")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: "req1",
              requester: {
                _id: "u1",
                email: "friend@email.com",
                name: "Friend",
              },
              recipient: { _id: "me", email: "me@email.com", name: "Me" },
              status: "pending",
              createdAt: "",
              updatedAt: "",
            },
          ]),
      });
    }
    if (url?.toString().includes("type=friends")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: "req2",
              requester: { _id: "me", email: "me@email.com", name: "Me" },
              recipient: {
                _id: "u2",
                email: "friend2@email.com",
                name: "Friend2",
              },
              status: "accepted",
              createdAt: "",
              updatedAt: "",
            },
          ]),
      });
    }
    // Accept/delete friend request
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  }) as jest.Mock;
});

describe("ViewFriend", () => {
  it("opens dialog and displays friends and requests", async () => {
    render(
      <DashboardProvider>
        <ViewFriend />
      </DashboardProvider>
    );
    // Open the dialog/modal
    fireEvent.click(screen.getByText(/view friends/i));

    // Wait for friends and requests to load
    await waitFor(() => {
      expect(screen.getByText(/friends:/i)).toBeInTheDocument();
      expect(screen.getByText(/friend requests:/i)).toBeInTheDocument();
      expect(screen.getByText(/friend2@email.com/i)).toBeInTheDocument();
      expect(screen.getByText(/friend@email.com/i)).toBeInTheDocument();
    });
  });

  it("calls addFriend when accept is clicked", async () => {
    render(
      <DashboardProvider>
        <ViewFriend />
      </DashboardProvider>
    );
    fireEvent.click(screen.getByText(/view friends/i));
    await waitFor(() => screen.getByText(/friend requests:/i));
    const acceptBtn = screen
      .getAllByRole("button")
      .find(
        (btn) => btn.querySelector("svg")?.getAttribute("color") === "green"
      );
    if (acceptBtn) {
      fireEvent.click(acceptBtn);
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/friend/"),
          expect.objectContaining({ method: "PATCH" })
        );
      });
    }
  });

  it("calls deleteFriendRequest when delete is clicked", async () => {
    render(
      <DashboardProvider>
        <ViewFriend />
      </DashboardProvider>
    );
    fireEvent.click(screen.getByText(/view friends/i));
    await waitFor(() => screen.getByText(/friend requests:/i));
    const deleteBtns = screen
      .getAllByRole("button")
      .filter(
        (btn) => btn.querySelector("svg")?.getAttribute("color") === "red"
      );
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[0]);
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/friend/"),
          expect.objectContaining({ method: "DELETE" })
        );
      });
    }
  });
});
