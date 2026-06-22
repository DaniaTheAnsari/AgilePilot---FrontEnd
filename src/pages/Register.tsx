import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DataStore } from "../services/dataStore";
import { Auth } from "../services/auth";

type Form = { name: string; email: string; password: string };

export default function Register() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();
  const [err, setErr] = React.useState<string | null>(null);

  function onSubmit(data: Form) {
    try {
      const user = { id: "u_" + Date.now(), name: data.name, email: data.email, password: data.password, role: "projectManager" };
      DataStore.createUser(user);
      Auth.login(data.email, data.password);
      navigate("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Could not create account");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 space-y-3">
      <h2 className="text-lg font-bold">Create account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input {...register("name")} placeholder="Full name" className="w-full p-2 bg-white/[0.02] border border-white/[0.06] rounded text-sm" />
        <input {...register("email")} placeholder="Email" className="w-full p-2 bg-white/[0.02] border border-white/[0.06] rounded text-sm" />
        <input {...register("password")} type="password" placeholder="Password" className="w-full p-2 bg-white/[0.02] border border-white/[0.06] rounded text-sm" />
        {err && <div className="text-xs text-red-400">{err}</div>}
        <button className="w-full py-2 bg-purple-600 rounded text-white font-medium">Create account</button>
      </form>
    </div>
  );
}