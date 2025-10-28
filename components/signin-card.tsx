"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Check, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

type AuthStep = "login" | "success";
type AuthMode = "login" | "signup";

export default function SignInCard() {
  const [step, setStep] = useState<AuthStep>("login");
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { data: session, status } = useSession();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        setStep("success");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const resetToLogin = () => {
  //   setStep("login");
  //   setMode("login");
  //   setFormData({ email: "", password: "" });
  // };

  const getCardHeight = () => {
    switch (step) {
      case "login":
        return "h-[480px]";
      case "success":
        return "h-[320px]";
      default:
        return "h-[480px]";
    }
  };

  return (
    <div
      className={`w-[450px] max-w-[450px] transition-all duration-700 ease-out ${getCardHeight()}`}
    >
      <div className="relative h-full">
        {/* Glass morphism card */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-3xl" />
        </div>

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col">
          {step === "login" && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-white">
                  Welcome Back
                </h1>
                <p className="text-white/70">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-300 text-sm text-center bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40 h-11 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
              <button
                // onClick={resetToLogin}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <Link href='/'>
                  <X className="w-5 h-5" />
                </Link>
              </button>

              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-white">
                  {step === "success" && mode === "signup"
                    ? "Welcome!"
                    : "Success!"}
                </h1>
                <p className="text-white/70">
                  {status === "authenticated" && session?.user?.email ? (
                    <>Welcome back, {session.user.email}!</>
                  ) : (
                    <>You&apos;re all set! </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
