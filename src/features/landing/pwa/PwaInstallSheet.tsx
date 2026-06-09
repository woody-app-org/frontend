import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Share2, PlusSquare, Check } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { showSuccessToast, showInfoToast } from "@/lib/toast";
import {
  isAndroid,
  isIOS,
  isIOSNonSafari,
  isIOSSafari,
  isMobileViewport,
} from "@/lib/pwa/platform";
import { usePwaInstall } from "@/lib/pwa/usePwaInstall";
import { AndroidManualInstallSteps } from "./AndroidManualInstallSteps";

export interface PwaInstallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function IOSInstallSteps() {
  const steps = [
    { icon: Share2, text: "Toque no botão Compartilhar do Safari (ícone com seta para cima)." },
    { icon: PlusSquare, text: 'Escolha "Adicionar à Tela de Início".' },
    { icon: Check, text: 'Confirme em "Adicionar".' },
  ];

  return (
    <ol className="mt-4 space-y-3 text-left text-sm text-[var(--woody-text)]">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--woody-lime)]/25 text-[var(--woody-ink)]"
            aria-hidden
          >
            <step.icon className="size-4" />
          </span>
          <span className="pt-1 leading-snug">
            <span className="font-semibold text-[var(--woody-ink)]">{index + 1}. </span>
            {step.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PwaInstallSheet({ open, onOpenChange }: PwaInstallSheetProps) {
  const { canPromptInstall, isInstalled, install } = usePwaInstall();
  const [installing, setInstalling] = useState(false);
  const mobile = isMobileViewport();
  const ios = isIOS();
  const android = isAndroid();

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome === "accepted") {
        showSuccessToast("Woody instalada com sucesso.");
        onOpenChange(false);
      } else if (outcome === "dismissed") {
        showInfoToast("Instalação cancelada. Pode tentar de novo quando quiser.");
      }
    } finally {
      setInstalling(false);
    }
  }, [install, onOpenChange]);

  const handleCopyLink = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      showSuccessToast("Link copiado.");
    } catch {
      showInfoToast(url || "Não foi possível copiar o link.");
    }
  }, []);

  let body: React.ReactNode;

  if (isInstalled) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-[var(--woody-muted)]">
          Woody já está instalada neste dispositivo. Abra pelo ícone na tela inicial.
        </p>
        <Button asChild className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90">
          <Link to="/feed" onClick={() => onOpenChange(false)}>
            Abrir Woody
          </Link>
        </Button>
      </div>
    );
  } else if (!mobile) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-[var(--woody-muted)]">
          Escaneie o QR Code com o celular para instalar a Woody na tela inicial — como um app, sem
          loja de aplicativos.
        </p>
        {canPromptInstall && (
          <Button
            type="button"
            className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
            disabled={installing}
            onClick={() => void handleInstall()}
          >
            {installing ? "Abrindo…" : "Instalar no computador"}
          </Button>
        )}
        <Button type="button" variant="outline" className="w-full" onClick={() => void handleCopyLink()}>
          Copiar link
        </Button>
      </div>
    );
  } else if (ios) {
    body = (
      <div className="space-y-3">
        {isIOSNonSafari() && (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Para instalar, abra esta página no <strong>Safari</strong>. No Chrome ou Edge do iPhone a
            opção pode não aparecer.
          </p>
        )}
        {isIOSSafari() && (
          <p className="text-sm text-[var(--woody-muted)]">
            No iPhone não é possível instalar automaticamente. Siga os passos abaixo no Safari:
          </p>
        )}
        <h3 className="text-base font-semibold text-[var(--woody-ink)]">Adicionar Woody à Tela de Início</h3>
        <IOSInstallSteps />
      </div>
    );
  } else if (android && canPromptInstall) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-[var(--woody-muted)]">
          Adicione a Woody à tela inicial e acesse como um app.
        </p>
        <Button
          type="button"
          className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
          disabled={installing}
          onClick={() => void handleInstall()}
        >
          {installing ? "Abrindo…" : "Instalar Woody"}
        </Button>
      </div>
    );
  } else if (android) {
    body = (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[var(--woody-ink)]">Adicionar Woody à tela inicial</h3>
        <AndroidManualInstallSteps />
        <Button type="button" variant="outline" className="w-full" onClick={() => void handleCopyLink()}>
          Copiar link
        </Button>
      </div>
    );
  } else if (canPromptInstall) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-[var(--woody-muted)]">
          O navegador pode instalar a Woody como atalho. Toque abaixo e confirme no prompt do sistema.
        </p>
        <Button
          type="button"
          className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
          disabled={installing}
          onClick={() => void handleInstall()}
        >
          {installing ? "Abrindo…" : "Instalar agora"}
        </Button>
      </div>
    );
  } else {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-[var(--woody-muted)]">
          Abra o menu do navegador e procure por &quot;Instalar app&quot;, &quot;Adicionar à tela inicial&quot; ou
          equivalente. Se não encontrar, use outro navegador compatível (Chrome ou Edge no Android).
        </p>
        <Button type="button" variant="outline" className="w-full" onClick={() => void handleCopyLink()}>
          Copiar link
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0 sm:max-w-md",
          "max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full",
          "max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl"
        )}
        overlayClassName="max-sm:items-end"
      >
        <div className="border-b border-[var(--woody-divider)] px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <DialogHeader className="flex-col items-start gap-2">
            <DialogTitle className="font-display text-xl text-[var(--woody-ink)]">
              Instalar Woody no celular
            </DialogTitle>
            <DialogDescription className="text-left text-sm leading-relaxed">
              Crie um atalho da Woody na tela inicial e acesse como um app, sem passar pela loja.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 sm:px-6">{body}</div>

        <div className="flex flex-col gap-2 border-t border-[var(--woody-divider)] px-5 py-4 sm:px-6">
          {ios && !isInstalled && !canPromptInstall && (
            <p className="text-center text-xs text-[var(--woody-muted)]">
              A instalação depende dos passos acima — não há instalação automática no iPhone.
            </p>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline" className={cn("w-full", woodyFocus)}>
              Fechar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
