import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePastelColor(seed: string) {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-cyan-100", text: "text-cyan-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
    { bg: "bg-violet-100", text: "text-violet-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
  ];

  const index = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  return colors[index % colors.length];
}
