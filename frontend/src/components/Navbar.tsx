import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, ChevronDown, UserCog, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { ThemeToggle } from "./ui/ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const name = user?.username?.trim() || "U";
    return name.slice(0, 1).toUpperCase();
  }, [user?.username]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md dark:bg-surface">
      <div className="flex items-center justify-between px-page h-12">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 transition hover:opacity-80"
            title="Home"
          >
            <div className="rounded-ui bg-primary-500 p-1.5">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-body-sm font-semibold text-foreground sm:block">
              VocabMaster
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/bookshelf")}
            className="hidden rounded-ui px-3 py-1.5 text-body-sm font-medium text-foreground-secondary transition hover:bg-surface hover:text-foreground sm:inline-block"
          >
            Books
          </button>
        </div>

        {/* Right: theme toggle + user menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-ui border border-border bg-surface px-2 py-1 transition hover:bg-elevated"
          >
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-500 text-xs font-semibold text-white">
              {initials}
            </div>
            <span className="hidden text-body-sm text-foreground sm:block">
              {user?.username || "User"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-foreground-muted transition" />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 top-full mt-1.5 w-56 origin-top-right overflow-hidden rounded-modal border border-border bg-surface shadow-modal transition-all duration-150 ease-out ${
              menuOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0"
            }`}
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-caption text-foreground-muted">Signed in as</p>
              <p className="mt-0.5 truncate text-body-sm font-semibold text-foreground">
                {user?.username || "Guest"}
              </p>
            </div>

            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  toast.message("Settings coming soon");
                }}
                className="flex w-full items-center gap-2 rounded-ui px-3 py-2 text-body-sm text-foreground-secondary transition hover:bg-surface hover:text-foreground"
              >
                <UserCog className="h-4 w-4 text-foreground-muted" />
                <span>Account</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-ui px-3 py-2 text-body-sm text-destructive-500 transition hover:bg-destructive-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
