"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase-provider";
import LoadingScreen from "./loading-screen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (session?.user?.id) {
        await router.replace("/dashboard");
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [session, router]);

  if (isLoading || session?.user?.id) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
