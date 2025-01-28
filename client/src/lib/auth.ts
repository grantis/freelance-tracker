import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export function useUser() {
  return useQuery({
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
  window.location.href = "/api/auth/google";
}
