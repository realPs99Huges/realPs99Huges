import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Konto erstellen" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
