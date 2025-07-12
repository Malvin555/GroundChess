"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3),
  password: z.string().min(6),
});

type SignupFormData = z.infer<typeof formSchema>;

export default function SignupForm() {
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<SignupFormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const msg = await res.text();
      setError(msg);
    } else {
      window.location.href = "/auth/login";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[300px]">
      <h2 className="text-2xl font-bold">Sign Up</h2>

      <input
        {...register("email")}
        placeholder="Email"
        className="w-full p-2 border"
      />
      <input
        {...register("username")}
        placeholder="Username"
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
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
}
