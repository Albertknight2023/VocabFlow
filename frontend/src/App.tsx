import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";
import Navbar from "./components/Navbar";
import AppRoutes from "./router/AppRoutes";

function App() {
  const { isAuthed, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthed && <Navbar />}
      <main
        className={
          isAuthed
            ? "w-full px-4 pt-24 pb-4 sm:px-6 lg:px-10 xl:px-14"
            : "w-full px-4 py-6 sm:px-6 lg:px-10 xl:px-14"
        }
      >
        <AppRoutes isAuthed={isAuthed} />
      </main>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}

export default App;
