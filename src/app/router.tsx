import { createBrowserRouter } from "react-router-dom";
import { FeedPage } from "@/features/feed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FeedPage />,
  },
]);