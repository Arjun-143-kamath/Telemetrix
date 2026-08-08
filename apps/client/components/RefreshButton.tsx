"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${url}/sync`, {
        method: "POST",
      });
      if (res.ok) {
        // Force Next.js to refresh Server Components data
        router.refresh();
      } else {
        console.error("Failed to refresh data");
      }
    } catch (error) {
      console.error("Error triggering sync:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded-full font-semibold text-sm
        transition-all duration-300
        ${
          isRefreshing
            ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255,24,1,0.4)]"
        }
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </button>
  );
}
