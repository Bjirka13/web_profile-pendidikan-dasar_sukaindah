import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Schools from "./pages/Schools";
import SchoolDetail from "./pages/SchoolDetail";
import Statistics from "./pages/Statistics";
import About from "./pages/About";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/sekolah",
    Component: Schools,
  },
  {
    path: "/statistik",
    Component: Statistics,
  },
  {
    path: "/know-about-us",
    Component: About,
  },
  {
    path: "/admin",
    Component: Admin,
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
