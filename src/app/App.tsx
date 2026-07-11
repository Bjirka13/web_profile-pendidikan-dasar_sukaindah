import { RouterProvider } from "react-router";
import { router } from "./routes";
import { SchoolCmsProvider } from "./cms/school-cms";

export default function App() {
  return (
    <SchoolCmsProvider>
      <RouterProvider router={router} />
    </SchoolCmsProvider>
  );
}
