"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BedDouble,
  CalendarRange,
  Users,
  Menu,
  X,
  FileEdit,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/supabase-provider";
import Image from "next/image";
import LoadingScreen from "@/app/(auth)/loading-screen";

interface SidebarLink {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const sidebarLinks: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BedDouble, label: "Pokoje", href: "/dashboard/pokoje" },
  { icon: CalendarRange, label: "Rezervace", href: "/dashboard/rezervace" },
  { icon: Users, label: "Zákazníci", href: "/dashboard/zakaznici" },
  { icon: FileEdit, label: "CMS", href: "/dashboard/cms" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, session } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await router.prefetch("/");
      await signOut();
      router.replace("/");
    } catch (error) {
      setIsLoggingOut(false);
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (!session && !isLoggingOut) {
      router.replace("/");
    }
  }, [session, router, isLoggingOut]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isLoggingOut || !session) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transition-transform border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full px-3 py-4">
          <div className="mb-6 px-2 flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="mb-2"
              priority
            />
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <ModeToggle />
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "transition-margin duration-300 ease-in-out",
          isSidebarOpen ? "md:ml-64" : "ml-0"
        )}
      >
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-primary/5"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-primary/5 flex items-center gap-2 px-3"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm">
                    {session.user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Odhlásit se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
