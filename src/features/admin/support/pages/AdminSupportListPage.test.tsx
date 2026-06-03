import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminSupportListPage } from "./AdminSupportListPage";
import type { AdminSupportListResponse } from "../services/adminSupport.service";

vi.mock("@/features/feed/components/FeedLayout", () => ({
  FeedLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="feed-layout">{children}</div>
  ),
}));

vi.mock("@/features/admin/components/AdminNav", () => ({
  AdminNav: () => <nav data-testid="admin-nav" />,
}));

vi.mock("../services/adminSupport.service", () => ({
  listAdminSupportTickets: vi.fn(),
}));

import { listAdminSupportTickets } from "../services/adminSupport.service";

const mockList = vi.mocked(listAdminSupportTickets);

const emptyResponse: AdminSupportListResponse = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe("AdminSupportListPage — apelo de banimento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe badge Revisão de banimento para ticket isBanAppeal", async () => {
    mockList.mockResolvedValue({
      ...emptyResponse,
      items: [
        {
          publicId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          category: "AccountBanAppeal",
          title: "Solicitação de revisão de banimento",
          status: "Open",
          priority: "High",
          visibility: "Private",
          isBanAppeal: true,
          author: { emailMasked: "a***@example.com" },
          createdAt: "2026-06-03T12:00:00Z",
          updatedAt: "2026-06-03T12:00:00Z",
        },
      ],
      totalCount: 1,
    });

    render(
      <MemoryRouter initialEntries={["/admin/support"]}>
        <Routes>
          <Route path="/admin/support" element={<AdminSupportListPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Revisão de banimento")).toBeInTheDocument();
    });
  });
});
