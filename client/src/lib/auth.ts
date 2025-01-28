import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import type { User } from "./types";

export function useUser() {
  return useQuery<User>({
    queryKey: ["/api/auth/user"],
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function loginWithGoogle() {
  // Store a flag in sessionStorage to indicate authentication is in progress
  sessionStorage.setItem("auth_in_progress", "true");
  window.location.href = "/api/auth/google";
}

// Check if authentication is in progress
export function isAuthenticating() {
  return sessionStorage.getItem("auth_in_progress") === "true";
}

// Clear authentication progress
export function clearAuthenticating() {
  sessionStorage.removeItem("auth_in_progress");
}