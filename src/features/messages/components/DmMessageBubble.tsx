import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { MessageResponseDto } from "../types";
import { formatMessageDetailTimestamp } from "../lib/formatMessageTimestamp";
import { DM_MESSAGE_BODY_MAX_LENGTH } from "../lib/dmLimits";
import { DmMessageActionsMenu } from "./DmMessageActionsMenu";

function senderInitials(sender: MessageResponseDto["sender"]): string {
  const raw = (sender.displayName || sender.username || "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return raw.slice(0, 2).toUpperCase();
}

export interface DmMessageBubbleProps {
  message: MessageResponseDto;
  isMine: boolean;
  onSaveEdit: (messageId: number, body: string) => Promise<void>;
  onDelete: (messageId: number) => Promise<void>;
  onMutationError: (message: string) => void;
}

export function DmMessageBubble({ message, isMine, onSaveEdit, onDelete, onMutationError }: DmMessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.body ?? "");
  const [busy, setBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!editing) setEditDraft(message.body ?? "");
  }, [message.body, message.id, editing]);

  const canEdit = isMine && !message.isDeleted && Boolean(message.body?.trim());
  const showMeta = !message.isDeleted;
  const timePrimary = formatMessageDetailTimestamp(message.createdAt);
  const timeSecondary =
    message.isEdited && message.editedAt ? `Editada ${formatMessageDetailTimestamp(message.editedAt)}` : null;

  const startEdit = () => {
    setEditDraft(message.body ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditDraft(message.body ?? "");
  };

  const saveEdit = async () => {
    const next = editDraft.trim();
    if (!next) return;
    setBusy(true);
    try {
      await onSaveEdit(message.id, next);
      setEditing(false);
    } catch (e) {
      onMutationError(e instanceof Error ? e.message : "Não foi possível editar.");
    } finally {
      setBusy(false);
    }
  };

  const executeDelete = async () => {
    setBusy(true);
    try {
      await onDelete(message.id);
      setDeleteDialogOpen(false);
    } catch (e) {
      onMutationError(e instanceof Error ? e.message : "Não foi possível apagar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    <li className={cn("flex w-full max-w-full", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex min-w-0 max-w-[min(100%,26rem)] gap-2",
          isMine ? "flex-row-reverse" : "flex-row"
        )}
      >
      {!isMine ? (
        <Avatar size="sm" className="mt-0.5 ring-1 ring-[var(--woody-divider)]">
          {message.sender.profilePic ? (
            <AvatarImage src={message.sender.profilePic} alt="" />
          ) : null}
          <AvatarFallback className="bg-[var(--woody-nav)]/12 text-[0.65rem] font-semibold text-[var(--woody-text)]">
            {senderInitials(message.sender)}
          </AvatarFallback>
        </Avatar>
      ) : null}

      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "w-full rounded-2xl border px-3 py-2 text-sm shadow-sm transition-[box-shadow]",
            isMine
              ? "border-[var(--woody-nav)]/25 bg-gradient-to-br from-[var(--woody-nav)]/14 to-[var(--woody-nav)]/8"
              : "border-[var(--woody-divider)] bg-[var(--woody-card)]"
          )}
        >
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              {!isMine && showMeta ? (
                <p className="mb-1 truncate text-xs font-medium text-[var(--woody-muted)]">
                  {message.sender.displayName ?? message.sender.username}
                </p>
              ) : null}

              {message.isDeleted ? (
                <p className="italic text-[var(--woody-muted)]">Mensagem apagada</p>
              ) : editing ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    maxLength={DM_MESSAGE_BODY_MAX_LENGTH}
                    rows={3}
                    className="min-h-[72px] resize-none text-[var(--woody-text)]"
                    disabled={busy}
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8" onClick={cancelEdit} disabled={busy}>
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      onClick={() => void saveEdit()}
                      disabled={busy || !editDraft.trim()}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {message.body ? (
                    <p className="whitespace-pre-wrap break-words text-[var(--woody-text)]">{message.body}</p>
                  ) : null}
                  {message.attachments?.length ? (
                    <ul className={cn("list-none space-y-2 p-0", message.body ? "mt-2" : "")}>
                      {message.attachments.map((a) => {
                        const mt = a.mediaType ?? "image";
                        return (
                          <li key={a.id}>
                          {mt === "video" ? (
                            <video
                              src={a.url}
                              className="max-h-56 w-full rounded-xl object-cover ring-1 ring-[var(--woody-divider)]/80 sm:max-h-64"
                              controls
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                woodyFocus.ring,
                                "block overflow-hidden rounded-xl ring-1 ring-[var(--woody-divider)]/80"
                              )}
                            >
                              <img
                                src={a.url}
                                alt=""
                                className={cn(
                                  "max-h-56 w-full object-cover sm:max-h-64",
                                  mt === "sticker" && "object-contain max-h-40 bg-transparent"
                                )}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            </a>
                          )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </>
              )}
            </div>

            {isMine && !message.isDeleted && !editing ? (
              <DmMessageActionsMenu
                canEdit={canEdit}
                onEdit={startEdit}
                onDelete={() => setDeleteDialogOpen(true)}
                disabled={busy}
              />
            ) : null}
          </div>
        </div>

        {showMeta ? (
          <div
            className={cn(
              "flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 px-1 text-[0.7rem] text-[var(--woody-muted)]",
              isMine ? "justify-end text-right" : "justify-start"
            )}
          >
            <time dateTime={message.createdAt} title={timePrimary}>
              {timePrimary}
            </time>
            {message.isEdited && !message.isDeleted ? (
              <span className="text-[var(--woody-muted)]/90" title={timeSecondary ?? undefined}>
                (editada)
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      </div>
    </li>

    <Dialog open={deleteDialogOpen} onOpenChange={(open) => !busy && setDeleteDialogOpen(open)}>
      <DialogContent
        className={cn(
          "max-w-[min(100vw-1.5rem,22rem)] gap-5 border-[var(--woody-divider)] bg-[var(--woody-card)] p-5 shadow-[0_20px_50px_rgba(10,10,10,0.18)] sm:p-6"
        )}
        onPointerDownOutside={(e) => {
          if (busy) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <DialogHeader className="flex-col items-stretch gap-1 text-left sm:text-left">
          <DialogTitle className="text-base font-semibold text-[var(--woody-text)]">Apagar mensagem?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[var(--woody-muted)]">
            Isto remove o texto e os anexos para ambas as pessoas. Não é possível anular.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-[var(--woody-divider)] bg-[var(--woody-bg)] sm:w-auto"
            disabled={busy}
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => void executeDelete()}
          >
            {busy ? "A apagar…" : "Apagar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
