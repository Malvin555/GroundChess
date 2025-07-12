"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const msg = await res.text();
      setError(msg);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[300px]">
      <h2 className="text-2xl font-bold">Login</h2>

      <input
        {...register("email")}
        placeholder="Email"
        className="w-full p-2 border"
      />
      <input
        type="password"
        {...register("password")}
        placeholder="Password"
        className="w-full p-2 border"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded"
      >
        Login
      </button>
    </form>
  );
}
