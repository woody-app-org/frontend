import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminSupportDetailPage } from "./AdminSupportDetailPage";
import type { AdminSupportTicketDetail } from "../services/adminSupport.service";

vi.mock("@/features/feed/components/FeedLayout", () => ({
  FeedLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="feed-layout">{children}</div>
  ),
}));

vi.mock("@/features/admin/components/AdminNav", () => ({
  AdminNav: () => <nav data-testid="admin-nav" />,
}));

vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("../services/adminSupport.service", () => ({
  getAdminSupportTicket: vi.fn(),
  updateAdminSupportTicket: vi.fn(),
  replyAdminSupportTicket: vi.fn(),
  getAdminSupportErrorMessage: vi.fn(),
}));

import { getAdminSupportTicket } from "../services/adminSupport.service";

const mockGet = vi.mocked(getAdminSupportTicket);

const publicId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const banAppealDetail: AdminSupportTicketDetail = {
  publicId,
  category: "AccountBanAppeal",
  title: "Solicitação de revisão de banimento",
  description: "Peço revisão da decisão.",
  status: "Open",
  priority: "High",
  visibility: "Private",
  isBanAppeal: true,
  author: { emailMasked: "b***@example.com", username: "appeal-banned" },
  relatedUserId: "42",
  createdAt: "2026-06-03T12:00:00Z",
  updatedAt: "2026-06-03T12:00:00Z",
  messages: [],
};

describe("AdminSupportDetailPage — apelo de banimento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(banAppealDetail);
  });

  it("exibe badge Revisão de banimento e conta relacionada", async () => {
    render(
      <MemoryRouter initialEntries={[`/admin/support/${publicId}`]}>
        <Routes>
          <Route path="/admin/support/:publicId" element={<AdminSupportDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Revisão de banimento")).toBeInTheDocument();
    });

    expect(screen.getByText(/conta relacionada/i)).toBeInTheDocument();
    expect(screen.getByText(/ID 42/)).toBeInTheDocument();
  });
});
