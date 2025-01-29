import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  googleId: string | null;
  isAdmin: boolean;
  isFreelancer: boolean;
}

export function useUser() {
  const query = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
    initialData: null
  });

  return query;
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