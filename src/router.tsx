import { createBrowserRouter } from "react-router-dom";
import {
  AppShell,
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/router-views";
import { DashboardPage } from "@/pages/dashboard";
import { NotFoundPage } from "@/pages/not-found";
import { SignInPage } from "@/pages/sign-in";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
      {
        element: <PublicOnlyRoute />,
        children: [{ path: "sign-in", element: <SignInPage /> }],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
