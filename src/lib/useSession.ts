"use client";

import { useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  image: string;
  spotifyId: string;
}

interface SessionState {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    user: null,
    status: "loading",
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setState({ user: data.user, status: "authenticated" });
        } else {
          setState({ user: null, status: "unauthenticated" });
        }
      })
      .catch(() => {
        setState({ user: null, status: "unauthenticated" });
      });
  }, []);

  return state;
}
