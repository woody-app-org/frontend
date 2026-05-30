import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminReportDetailPage } from "./AdminReportDetailPage";
import type { AdminReportDetail } from "../services/adminReports.service";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/features/feed/components/FeedLayout", () => ({
  FeedLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="feed-layout">{children}</div>
  ),
}));

vi.mock("@/features/admin/components/AdminNav", () => ({
  AdminNav: () => <nav data-testid="admin-nav" />,
}));

vi.mock("../services/adminReports.service", () => ({
  getAdminReportDetail: vi.fn(),
  updateAdminReportStatus: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  resolvePublicMediaUrl: (url: string) => url,
}));

vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

import { getAdminReportDetail, updateAdminReportStatus } from "../services/adminReports.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const mockGet = vi.mocked(getAdminReportDetail);
const mockUpdate = vi.mocked(updateAdminReportStatus);
const mockSuccessToast = vi.mocked(showSuccessToast);
const mockErrorToast = vi.mocked(showErrorToast);

const reporter = { id: "10", name: "Joana Silva", username: "joana", avatarUrl: null };
const author = { id: "20", name: "Maria Souza", username: "maria", avatarUrl: null };

const postDetail: AdminReportDetail = {
  id: 1,
  targetType: "post",
  reasonCode: "spam",
  details: "Vejo isso como spam.",
  status: "Pending",
  internalNote: null,
  resolutionCode: null,
  reporterUser: reporter,
  reportedContentAuthor: author,
  reviewedBy: null,
  post: {
    id: 5,
    publicId: "pst_abc001",
    content: "Conteúdo do post denunciado.",
    isDeleted: false,
    createdAt: "2026-01-10T08:00:00Z",
    media: [],
  },
  comment: null,
  sameTargetReportCount: 1,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: null,
  reviewedAt: null,
};

const commentDetail: AdminReportDetail = {
  ...postDetail,
  id: 2,
  targetType: "comment",
  post: null,
  comment: {
    id: 7,
    content: "Comentário ofensivo aqui.",
    isDeleted: false,
    createdAt: "2026-01-12T09:00:00Z",
    parentPost: {
      id: 5,
      publicId: "pst_abc001",
      content: "Post pai do comentário.",
      isDeleted: false,
      createdAt: "2026-01-10T08:00:00Z",
      media: [],
    },
  },
};

function renderDetail(id = "1") {
  return render(
    <MemoryRouter initialEntries={[`/admin/reports/${id}`]}>
      <Routes>
        <Route path="/admin/reports/:id" element={<AdminReportDetailPage />} />
        <Route path="/admin/reports" element={<div data-testid="list-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("AdminReportDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renderiza denúncia de post ──────────────────────────────────────────────

  it("renderiza detalhes de denúncia de post", async () => {
    mockGet.mockResolvedValue(postDetail);

    renderDetail("1");

    await waitFor(() => {
      expect(screen.getByText("Conteúdo do post denunciado.")).toBeInTheDocument();
    });

    expect(screen.getByText("Spam")).toBeInTheDocument(); // reasonLabel
    expect(screen.getByText("@joana")).toBeInTheDocument(); // reporter username
  });

  // ── Renderiza denúncia de comentário ────────────────────────────────────────

  it("renderiza detalhes de denúncia de comentário", async () => {
    mockGet.mockResolvedValue(commentDetail);

    renderDetail("2");

    await waitFor(() => {
      expect(screen.getByText("Comentário ofensivo aqui.")).toBeInTheDocument();
    });

    expect(screen.getByText("Post pai do comentário.")).toBeInTheDocument();
  });

  // ── Conteúdo indisponível ───────────────────────────────────────────────────

  it("exibe mensagem quando conteúdo está indisponível", async () => {
    const noContent: AdminReportDetail = { ...postDetail, post: null, comment: null };
    mockGet.mockResolvedValue(noContent);

    renderDetail("1");

    await waitFor(() => {
      expect(
        screen.getByText("Conteúdo indisponível ou removido.")
      ).toBeInTheDocument();
    });
  });

  // ── Status badge ─────────────────────────────────────────────────────────────

  it("exibe status badge correto", async () => {
    mockGet.mockResolvedValue(postDetail);

    renderDetail("1");

    await waitFor(() => {
      // Badge aparece mais de uma vez (badge no header + select); pelo menos um deve existir
      expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
    });
  });

  // ── Nota interna ─────────────────────────────────────────────────────────────

  it("exibe nota interna quando presente", async () => {
    const withNote: AdminReportDetail = {
      ...postDetail,
      internalNote: "Verificado — removido manualmente.",
    };
    mockGet.mockResolvedValue(withNote);

    renderDetail("1");

    await waitFor(() => {
      // A nota aparece tanto no display quanto na textarea; ambos devem estar no DOM
      const occurrences = screen.getAllByText("Verificado — removido manualmente.");
      expect(occurrences.length).toBeGreaterThan(0);
    });
  });

  // ── Alterar status chama PATCH ───────────────────────────────────────────────

  it("chama updateAdminReportStatus ao salvar decisão", async () => {
    mockGet.mockResolvedValue(postDetail);
    mockUpdate.mockResolvedValue({ ...postDetail, status: "InReview" });

    renderDetail("1");

    await waitFor(() => screen.getByText("Conteúdo do post denunciado."));

    const select = screen.getByDisplayValue("Pendente");
    fireEvent.change(select, { target: { value: "InReview" } });

    const saveBtn = screen.getByRole("button", { name: /salvar decisão/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({ status: "InReview" }));
    });
  });

  // ── Toast de sucesso após salvar ─────────────────────────────────────────────

  it("exibe toast de sucesso após salvar", async () => {
    mockGet.mockResolvedValue(postDetail);
    mockUpdate.mockResolvedValue({ ...postDetail, status: "Resolved" });

    renderDetail("1");

    await waitFor(() => screen.getByText("Conteúdo do post denunciado."));

    const saveBtn = screen.getByRole("button", { name: /salvar decisão/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockSuccessToast).toHaveBeenCalledWith(
        "Denúncia atualizada.",
        expect.anything()
      );
    });
  });

  // ── Erro de PATCH exibe toast de erro ────────────────────────────────────────

  it("exibe toast de erro quando PATCH falha", async () => {
    mockGet.mockResolvedValue(postDetail);
    mockUpdate.mockRejectedValue(new Error("Sem permissão"));

    renderDetail("1");

    await waitFor(() => screen.getByText("Conteúdo do post denunciado."));

    const saveBtn = screen.getByRole("button", { name: /salvar decisão/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith(
        "Sem permissão",
        expect.anything()
      );
    });
  });

  // ── 404 ──────────────────────────────────────────────────────────────────────

  it("exibe mensagem de erro quando relatório não é encontrado", async () => {
    mockGet.mockRejectedValue(new Error("Not found"));

    renderDetail("999");

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar os detalhes. Tente novamente.")
      ).toBeInTheDocument();
    });
  });

  // ── AdminNav presente ─────────────────────────────────────────────────────────

  it("renderiza AdminNav", async () => {
    mockGet.mockResolvedValue(postDetail);

    renderDetail("1");

    await waitFor(() => {
      expect(screen.getByTestId("admin-nav")).toBeInTheDocument();
    });
  });

  // ── Não expõe dados sensíveis ─────────────────────────────────────────────────

  it("não renderiza CPF ou e-mail", async () => {
    mockGet.mockResolvedValue(postDetail);

    renderDetail("1");

    await waitFor(() => screen.getByText("Conteúdo do post denunciado."));

    expect(screen.queryByText(/cpf/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/@.*\.com/i)).not.toBeInTheDocument();
  });

  // ── reviewedBy / reviewedAt ───────────────────────────────────────────────────

  it("exibe revisora e data de revisão quando presentes", async () => {
    const reviewed: AdminReportDetail = {
      ...postDetail,
      status: "Resolved",
      reviewedBy: { id: 99, username: "admin_user", displayName: "Admin" },
      reviewedAt: "2026-01-20T14:00:00Z",
    };
    mockGet.mockResolvedValue(reviewed);

    renderDetail("1");

    await waitFor(() => {
      expect(screen.getByText("@admin_user")).toBeInTheDocument();
    });
  });
});
