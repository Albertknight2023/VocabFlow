import { Navigate, Route, Routes } from "react-router-dom";
import ComponentLibraryView from "../views/ComponentLibraryView";
import DashboardView from "../views/DashboardView";
import BookshelfView from "../views/BookshelfView";
import LoginView from "../views/LoginView";
import RegisterView from "../views/RegisterView";
import ReviewView from "../views/ReviewView";
import SpellingView from "../views/SpellingView";
import WordDetailView from "../views/WordDetailView";
import WordbookWordsView from "../views/WordbookWordsView";


interface AppRoutesProps {
  isAuthed: boolean;
}

function AppRoutes({ isAuthed }: AppRoutesProps) {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthed ? <Navigate to="/" /> : <LoginView />}
      />
      <Route
        path="/register"
        element={isAuthed ? <Navigate to="/" /> : <RegisterView />}
      />
      <Route
        path="/"
        element={isAuthed ? <DashboardView /> : <Navigate to="/login" />}
      />
      <Route
        path="/bookshelf"
        element={isAuthed ? <BookshelfView /> : <Navigate to="/login" />}
      />
      <Route
        path="/wordbooks/:wordbookId"
        element={isAuthed ? <WordbookWordsView /> : <Navigate to="/login" />}
      />
      <Route
        path="/wordbooks/:wordbookId/words/:wordId"
        element={isAuthed ? <WordDetailView /> : <Navigate to="/login" />}
      />
      <Route
        path="/spelling/:wordbookId"
        element={isAuthed ? <SpellingView /> : <Navigate to="/login" />}
      />
      <Route
        path="/review/:wordbookId"
        element={isAuthed ? <ReviewView /> : <Navigate to="/login" />}
      />
      <Route
        path="/ui"
        element={isAuthed ? <ComponentLibraryView /> : <Navigate to="/login" />}
      />
      {!isAuthed && <Route path="*" element={<Navigate to="/login" />} />}
      {isAuthed && <Route path="*" element={<Navigate to="/" />} />}
    </Routes>
  );
}

export default AppRoutes;
