import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import SchoolDetail from "./pages/SchoolDetail";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/sekolah/:slug",
    Component: SchoolDetail,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
