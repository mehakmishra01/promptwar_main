import { Suspense } from "react";
import LoginPage from "./login-content";

export default function Login() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <LoginPage />
    </Suspense>
  );
}
