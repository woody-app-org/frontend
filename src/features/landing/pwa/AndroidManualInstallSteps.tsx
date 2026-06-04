import { MoreVertical, Menu, PlusSquare, Check } from "lucide-react";
import {
  isChromeAndroid,
  isEdgeAndroid,
  isFirefoxAndroid,
  isSamsungInternet,
} from "@/lib/pwa/platform";

type Step = { icon: typeof Menu; text: string };

function getAndroidManualSteps(): { intro: string; steps: Step[] } {
  if (isSamsungInternet()) {
    return {
      intro:
        "Seu navegador ainda não liberou o botão automático. Você pode adicionar manualmente pelo Samsung Internet.",
      steps: [
        { icon: Menu, text: "Toque no menu do navegador (ícone de três linhas ou similar)." },
        { icon: PlusSquare, text: 'Escolha "Adicionar página a".' },
        { icon: PlusSquare, text: 'Selecione "Tela inicial".' },
        { icon: Check, text: 'Confirme em "Adicionar" ou "OK".' },
      ],
    };
  }

  if (isEdgeAndroid()) {
    return {
      intro:
        "Seu navegador ainda não liberou o botão automático. Você pode adicionar manualmente pelo Edge.",
      steps: [
        { icon: Menu, text: "Toque no menu do navegador (ícone de três pontos)." },
        { icon: PlusSquare, text: 'Escolha "Adicionar ao telefone" ou "Adicionar à tela inicial".' },
        { icon: Check, text: 'Confirme em "Adicionar" ou "Instalar".' },
      ],
    };
  }

  if (isFirefoxAndroid()) {
    return {
      intro:
        "Seu navegador pode não oferecer instalação PWA completa. Use o menu do navegador para adicionar à tela inicial ou abra esta página no Chrome.",
      steps: [
        { icon: Menu, text: "Toque no menu do navegador (três pontos)." },
        { icon: PlusSquare, text: 'Procure "Instalar" ou "Adicionar à tela inicial".' },
        { icon: Check, text: "Confirme se a opção aparecer." },
      ],
    };
  }

  if (isChromeAndroid()) {
    return {
      intro:
        "Seu navegador ainda não liberou o botão automático. Você pode adicionar manualmente pelo Chrome.",
      steps: [
        { icon: MoreVertical, text: "Toque nos três pontinhos no canto superior direito." },
        { icon: PlusSquare, text: 'Escolha "Adicionar à tela inicial" ou "Instalar app".' },
        { icon: Check, text: 'Confirme em "Adicionar" ou "Instalar".' },
      ],
    };
  }

  return {
    intro:
      "Seu navegador ainda não liberou a instalação automática. Você pode adicionar a Woody pelo menu do navegador.",
    steps: [
      { icon: Menu, text: "Abra o menu do navegador (ícone ⋮ ou ≡)." },
      { icon: PlusSquare, text: 'Procure "Instalar app" ou "Adicionar à tela inicial".' },
      { icon: Check, text: "Confirme a instalação." },
    ],
  };
}

export function AndroidManualInstallSteps() {
  const { intro, steps } = getAndroidManualSteps();

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--woody-muted)]">{intro}</p>
      <ol className="space-y-3 text-left text-sm text-[var(--woody-text)]">
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
    </div>
  );
}
