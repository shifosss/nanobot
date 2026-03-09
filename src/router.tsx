import { createBrowserRouter } from "react-router-dom";
import {
  AppShell,
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/router-views";
import { AllSetPage } from "@/pages/all-set";
import { DashboardPage } from "@/pages/dashboard";
import { DetailPage } from "@/pages/detail";
import { IdfwPage } from "@/pages/idfw";
import { InfoCheckPage } from "@/pages/info-check";
import { LinkAccountPage } from "@/pages/link-account";
import { NotFoundPage } from "@/pages/not-found";
import { ProfilePage } from "@/pages/profile";
import { WelcomePage } from "@/pages/welcome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "detail", element: <DetailPage /> },
          { path: "idfw", element: <IdfwPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "welcome", element: <WelcomePage /> },
          { path: "info-check", element: <InfoCheckPage /> },
          { path: "link-account", element: <LinkAccountPage /> },
        ],
      },
      { path: "all-set", element: <AllSetPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
