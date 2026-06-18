import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";
import { ThemeProvider } from "./stores/themeStore";
import Navbar from "./components/Navbar";
import AppRoutes from "./router/AppRoutes";

function App() {
  const { isAuthed, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground-secondary">
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {isAuthed && <Navbar />}
        <main className={isAuthed ? "h-full pt-12" : "h-full"}>
          <AppRoutes isAuthed={isAuthed} />
        </main>
        <Toaster position="bottom-right" expand visibleToasts={5} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
