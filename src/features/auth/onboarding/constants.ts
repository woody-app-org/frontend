import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  Briefcase,
  Cpu,
  GraduationCap,
  Heart,
  HeartPulse,
  Palette,
  Rocket,
  Sparkles,
  SunMedium,
  Wallet,
} from "lucide-react";

/** Número de etapas do onboarding (alinhado ao roadmap do produto). */
export const ONBOARDING_TOTAL_STEPS = 6;

/** Títulos curtos por etapa (progresso + leitores de tela). */
export const ONBOARDING_STEP_LABELS: Record<number, string> = {
  1: "Conta",
  2: "E-mail",
  3: "Foto",
  4: "Interesses",
  5: "Comunidades",
  6: "Boas-vindas",
};

export const ONBOARDING_DRAFT_STORAGE_KEY = "woody_onboarding_draft";

export const ONBOARDING_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Máximo de interesses selecionáveis na etapa 4. */
export const ONBOARDING_MAX_INTERESTS = 5;

export interface OnboardingInterestDefinition {
  id: string;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
  /** Palavras-chave para recomendar comunidades (tags / descrições do seed). */
  matchKeywords: string[];
}

export const ONBOARDING_INTERESTS: OnboardingInterestDefinition[] = [
  {
    id: "carreira",
    label: "Carreira",
    subtitle: "Trabalho, transições e crescimento profissional",
    Icon: Briefcase,
    matchKeywords: ["carreira", "trabalho", "liderança", "tech", "programação"],
  },
  {
    id: "maternidade",
    label: "Maternidade",
    subtitle: "Gestação, bebês e redes de apoio",
    Icon: Baby,
    matchKeywords: ["maternidade", "filhos", "bebê", "família"],
  },
  {
    id: "estudos",
    label: "Estudos",
    subtitle: "Concursos, cursos e rotina de aprendizado",
    Icon: GraduationCap,
    matchKeywords: ["estudos", "concursos", "aprendizado", "curso"],
  },
  {
    id: "saude",
    label: "Saúde",
    subtitle: "Corpo, mente e autocuidado prático",
    Icon: HeartPulse,
    matchKeywords: ["saúde", "terapia", "ansiedade", "movimento", "nutrição"],
  },
  {
    id: "relacionamentos",
    label: "Relacionamentos",
    subtitle: "Vínculos, limites e conversas difíceis",
    Icon: Heart,
    matchKeywords: ["relacionamentos", "limites", "afeto", "comunicação"],
  },
  {
    id: "hobbies",
    label: "Hobbies",
    subtitle: "Criatividade, lazer e paixões fora do trabalho",
    Icon: Palette,
    matchKeywords: ["arte", "música", "maker", "hobby", "criatividade"],
  },
  {
    id: "tecnologia",
    label: "Tecnologia",
    subtitle: "Digital, carreira em tech e ferramentas",
    Icon: Cpu,
    matchKeywords: ["programação", "tech", "UX", "dados", "produto"],
  },
  {
    id: "bem-estar",
    label: "Bem-estar",
    subtitle: "Equilíbrio emocional e rotinas leves",
    Icon: Sparkles,
    matchKeywords: ["bem-estar", "terapia", "ansiedade", "apoio", "autocuidado"],
  },
  {
    id: "financas",
    label: "Finanças",
    subtitle: "Orçamento, investimentos e independência",
    Icon: Wallet,
    matchKeywords: ["finanças", "orçamento", "negócios", "pitch"],
  },
  {
    id: "autoestima",
    label: "Autoestima",
    subtitle: "Confiança, imagem e gentileza consigo",
    Icon: SunMedium,
    matchKeywords: ["autoestima", "corpo", "confiança", "acolhimento"],
  },
  {
    id: "leitura",
    label: "Leitura",
    subtitle: "Livros, textos e clubes do livro",
    Icon: BookOpen,
    matchKeywords: ["livros", "leitura", "literatura", "escrita"],
  },
  {
    id: "empreendedorismo",
    label: "Empreendedorismo",
    subtitle: "Ideias, negócios e propósito",
    Icon: Rocket,
    matchKeywords: ["negócios", "empreendedorismo", "pitch", "clientes"],
  },
];
