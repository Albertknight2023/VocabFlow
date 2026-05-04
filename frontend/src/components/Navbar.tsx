import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, ChevronDown, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-5 py-3 md:px-8 md:py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center rounded-md px-1 py-0.5 text-left transition hover:bg-zinc-100"
            >
              <h2 className="m-0 text-lg font-semibold tracking-tight text-zinc-950 md:text-xl">
                英语单词背诵助手
              </h2>
            </button>

            <button
              type="button"
              onClick={() => navigate("/bookshelf")}
              className="inline-flex items-center rounded-md px-1 py-0.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 md:text-[15px]"
            >
              词书
            </button>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-2 py-1.5 pr-3 text-left shadow-sm transition hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-zinc-900 to-zinc-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-sm font-medium text-zinc-900 sm:block">
              {user?.username || "User"}
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>

          <div
            className={`absolute right-0 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl transition-all duration-200 ease-out ${
              menuOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-600 text-base font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-950">
                  {user?.username || "Guest"}
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  toast.message("用户设置暂未开放");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-zinc-900 transition hover:bg-zinc-100"
              >
                <UserCog className="h-4 w-4 text-zinc-500" />
                设置用户
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4 text-zinc-500" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
