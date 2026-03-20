import Signup from "./Signup";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <Signup />
    </Suspense>
  );
}