import { createBrowserRouter } from "react-router-dom";
import { FeedPage } from "@/features/feed";
import { ProfilePage } from "@/features/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FeedPage />,
  },
  {
    path: "/profile/:userId",
    element: <ProfilePage />,
  },
]);