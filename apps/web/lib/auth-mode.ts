// Single source of truth for whether to skip Clerk entirely.
// "Demo mode" effectively = "Clerk is not active in this deploy".
// Treat a missing publishable key the same as demo mode so a half-configured
// Railway deploy still renders instead of crashing with "Missing publishableKey".
export const isAuthDisabled =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
