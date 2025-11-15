import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { organizationClient } from "better-auth/client/plugins";

// Get base URL - prefer current origin in browser, fallback to env or localhost
function getBaseURL() {
  if (typeof window !== "undefined") {
    // In browser, use current origin
    return window.location.origin;
  }
  // Server-side, use env or localhost
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  plugins: [organizationClient()],
  baseURL: getBaseURL(),
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        toast.error(
          `Too many requests. Please try again in ${retryAfter} seconds.`
        );
      }
    },
  },
});

export const signInWithEmail = async (email: string, password: string) => {
  const data = await authClient.signIn.email(
    {
      email,
      password,
    },
    {
      onError: (ctx) => {
        if (ctx.error.status === 403) {
          throw new Error("Please verify your email address");
        }
        throw new Error(ctx.error.message);
      },
    }
  );
  return data;
};
