import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Auth } from "../services/auth";

type Form = { email: string; password: string };

export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(data: Form) {
    try {
      Auth.login(data.email, data.password);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">Welcome back</h2>
      <p className="text-sm text-white/40 mb-4">Sign in to your AgilePilot demo account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register("email")} placeholder="Email" className="w-full p-2 bg-white/[0.02] border border-white/[0.06] rounded text-sm" />
        <input {...register("password")} type="password" placeholder="Password" className="w-full p-2 bg-white/[0.02] border border-white/[0.06] rounded text-sm" />
        {error && <div className="text-xs text-red-400">{error}</div>}
        <button className="w-full py-2 bg-purple-600 rounded text-white font-medium">Sign in</button>
      </form>

      <div className="mt-4 text-sm text-white/40">
        No account? <Link to="/register" className="text-purple-300">Create one</Link>
      </div>
    </div>
  );
}