import { createBrowserRouter } from "react-router-dom";
import {
  AppShell,
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/router-views";
import { DashboardPage } from "@/pages/dashboard";
import { NotFoundPage } from "@/pages/not-found";
import { PairDevicePage } from "@/pages/pair-device";
import { SignInPage } from "@/pages/sign-in";
import { WelcomePage } from "@/pages/welcome";

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
        children: [
          { path: "welcome", element: <WelcomePage /> },
          { path: "sign-in", element: <SignInPage /> },
        ],
      },
      { path: "pair", element: <PairDevicePage /> },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
