import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminReportsListPage } from "./AdminReportsListPage";
import type { AdminReportListResponse } from "../services/adminReports.service";

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
  listAdminReports: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  resolvePublicMediaUrl: (url: string) => url,
}));

import { listAdminReports } from "../services/adminReports.service";

const mockListAdminReports = vi.mocked(listAdminReports);

const emptyResponse: AdminReportListResponse = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  hasNextPage: false,
  hasPreviousPage: false,
};

function makeReport(id: number) {
  return {
    id,
    targetType: "post",
    reasonCode: "spam",
    status: "Pending" as const,
    reporterUser: { id: "10", name: "Joana Silva", username: "joana", avatarUrl: null },
    reportedContentAuthor: { id: "20", name: "Maria", username: "maria", avatarUrl: null },
    targetPreview: { postId: 5, contentSnippet: "conteúdo de teste" },
    sameTargetReportCount: 1,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: null,
  };
}

function renderList() {
  return render(
    <MemoryRouter initialEntries={["/admin/reports"]}>
      <Routes>
        <Route path="/admin/reports" element={<AdminReportsListPage />} />
        <Route path="/admin/reports/:id" element={<div data-testid="detail-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("AdminReportsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carrega denúncias ───────────────────────────────────────────────────────

  it("exibe lista de denúncias carregadas", async () => {
    mockListAdminReports.mockResolvedValue({
      ...emptyResponse,
      items: [makeReport(1), makeReport(2)],
      totalCount: 2,
    });

    renderList();

    await waitFor(() => {
      expect(screen.getAllByText("Ver detalhes")).toHaveLength(2);
    });
  });

  // ── Estado vazio ────────────────────────────────────────────────────────────

  it("exibe mensagem de estado vazio quando não há denúncias", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => {
      expect(screen.getByText("Nenhuma denúncia encontrada.")).toBeInTheDocument();
    });
  });

  // ── Filtro por status ───────────────────────────────────────────────────────

  it("filtra por status ao selecionar opção", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => screen.getByText("Nenhuma denúncia encontrada."));

    const select = screen.getByDisplayValue("Todos os status");
    fireEvent.change(select, { target: { value: "InReview" } });

    await waitFor(() => {
      expect(mockListAdminReports).toHaveBeenCalledWith(
        expect.objectContaining({ status: "InReview" })
      );
    });
  });

  // ── Filtro por targetType ───────────────────────────────────────────────────

  it("filtra por tipo ao selecionar opção", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => screen.getByText("Nenhuma denúncia encontrada."));

    const select = screen.getByDisplayValue("Todos os tipos");
    fireEvent.change(select, { target: { value: "post" } });

    await waitFor(() => {
      expect(mockListAdminReports).toHaveBeenCalledWith(
        expect.objectContaining({ targetType: "post" })
      );
    });
  });

  // ── Busca ────────────────────────────────────────────────────────────────────

  it("busca por nome ao clicar em Buscar", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => screen.getByText("Nenhuma denúncia encontrada."));

    const input = screen.getByPlaceholderText("Nome ou @username");
    fireEvent.change(input, { target: { value: "joana" } });

    const btn = screen.getByRole("button", { name: /buscar/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockListAdminReports).toHaveBeenCalledWith(
        expect.objectContaining({ search: "joana" })
      );
    });
  });

  it("busca por nome ao pressionar Enter", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => screen.getByText("Nenhuma denúncia encontrada."));

    const input = screen.getByPlaceholderText("Nome ou @username");
    fireEvent.change(input, { target: { value: "maria" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockListAdminReports).toHaveBeenCalledWith(
        expect.objectContaining({ search: "maria" })
      );
    });
  });

  // ── Limpar filtros ──────────────────────────────────────────────────────────

  it("limpa filtros ao clicar em Limpar", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => screen.getByText("Nenhuma denúncia encontrada."));

    // Ativa um filtro para o botão Limpar aparecer
    const select = screen.getByDisplayValue("Todos os status");
    fireEvent.change(select, { target: { value: "Pending" } });

    const clearBtn = await screen.findByRole("button", { name: /limpar/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      const calls = mockListAdminReports.mock.calls;
      const lastCall = calls.at(-1)?.[0];
      expect(lastCall?.status).toBeUndefined();
    });
  });

  // ── Botão Ver detalhes navega corretamente ──────────────────────────────────

  it("botão Ver detalhes navega para /admin/reports/:id", async () => {
    mockListAdminReports.mockResolvedValue({
      ...emptyResponse,
      items: [makeReport(42)],
      totalCount: 1,
    });

    renderList();

    const link = await screen.findByRole("link", { name: /ver detalhes/i });
    expect(link).toHaveAttribute("href", "/admin/reports/42");
  });

  // ── AdminNav presente ───────────────────────────────────────────────────────

  it("renderiza AdminNav", async () => {
    mockListAdminReports.mockResolvedValue(emptyResponse);

    renderList();

    await waitFor(() => {
      expect(screen.getByTestId("admin-nav")).toBeInTheDocument();
    });
  });

  // ── Erro de carregamento ────────────────────────────────────────────────────

  it("exibe mensagem de erro quando a API falha", async () => {
    mockListAdminReports.mockRejectedValue(new Error("Network error"));

    renderList();

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar as denúncias. Tente novamente.")
      ).toBeInTheDocument();
    });
  });
});
