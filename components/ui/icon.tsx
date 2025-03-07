import { icons } from "lucide-react";

export default function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const LucideIcon = icons[name as keyof typeof icons];

  return <LucideIcon className={className} />;
}
