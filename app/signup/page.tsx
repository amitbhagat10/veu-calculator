"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Create Auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("User creation failed");
      setLoading(false);
      return;
    }

    // 2️⃣ Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert([{ name: companyName }])
      .select()
      .single();

    if (companyError) {
      alert(companyError.message);
      setLoading(false);
      return;
    }

    // 3️⃣ Create profile linked to company
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        company_id: company.id,
        role: "company_admin",
      },
    ]);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
