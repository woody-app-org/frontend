import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  Briefcase,
  Brain,
  Coffee,
  Cpu,
  Dumbbell,
  Frame,
  GraduationCap,
  Heart,
  HeartPulse,
  Landmark,
  Leaf,
  Library,
  Megaphone,
  Moon,
  Palette,
  Plane,
  Rocket,
  Scale,
  Shirt,
  Sparkles,
  SunMedium,
  UtensilsCrossed,
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

export const ONBOARDING_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Máximo de interesses selecionáveis na etapa 4. */
export const ONBOARDING_MAX_INTERESTS = 10;

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
  {
    id: "questoes-sociais-politicas",
    label: "Questões Sociais e Políticas",
    subtitle: "Debates, causas e participação cidadã",
    Icon: Megaphone,
    matchKeywords: ["política", "sociedade", "cidadania", "debate", "causas"],
  },
  {
    id: "feminismo",
    label: "Feminismo",
    subtitle: "Lutas, conquistas e redes de apoio entre mulheres",
    Icon: Scale,
    matchKeywords: ["feminismo", "mulheres", "igualdade", "direitos"],
  },
  {
    id: "viagem",
    label: "Viagem",
    subtitle: "Roteiros, destinos e experiências pelo mundo",
    Icon: Plane,
    matchKeywords: ["viagem", "turismo", "destinos", "mochilão"],
  },
  {
    id: "culinaria",
    label: "Culinária",
    subtitle: "Receitas, cozinha e novos sabores",
    Icon: UtensilsCrossed,
    matchKeywords: ["culinária", "cozinha", "receitas", "gastronomia"],
  },
  {
    id: "literatura",
    label: "Literatura",
    subtitle: "Romances, poesia e clubes de leitura",
    Icon: BookOpen,
    matchKeywords: ["literatura", "livros", "poesia", "escrita"],
  },
  {
    id: "cafes",
    label: "Cafés",
    subtitle: "Cafeterias, encontros e cultura do café",
    Icon: Coffee,
    matchKeywords: ["café", "cafeteria", "encontros"],
  },
  {
    id: "esporte",
    label: "Esporte",
    subtitle: "Modalidades, competições e jogos",
    Icon: Dumbbell,
    matchKeywords: ["esporte", "competição", "jogos", "atividade física"],
  },
  {
    id: "fitness",
    label: "Fitness",
    subtitle: "Treinos, rotina e evolução física",
    Icon: HeartPulse,
    matchKeywords: ["fitness", "treino", "academia", "saúde"],
  },
  {
    id: "meio-ambiente",
    label: "Meio Ambiente",
    subtitle: "Sustentabilidade, natureza e consumo consciente",
    Icon: Leaf,
    matchKeywords: ["meio ambiente", "sustentabilidade", "natureza", "ecologia"],
  },
  {
    id: "museus",
    label: "Museus",
    subtitle: "Exposições, acervos e história",
    Icon: Landmark,
    matchKeywords: ["museus", "história", "cultura", "arte"],
  },
  {
    id: "exposicoes",
    label: "Exposições",
    subtitle: "Mostras de arte, fotografia e design",
    Icon: Frame,
    matchKeywords: ["exposições", "arte", "fotografia", "design"],
  },
  {
    id: "livrarias",
    label: "Livrarias",
    subtitle: "Sebos, lançamentos e passeios entre livros",
    Icon: Library,
    matchKeywords: ["livrarias", "sebos", "livros", "leitura"],
  },
  {
    id: "brechos",
    label: "Brechós",
    subtitle: "Moda circular, garimpo e estilo sustentável",
    Icon: Shirt,
    matchKeywords: ["brechó", "moda", "garimpo", "sustentabilidade"],
  },
  {
    id: "letramento-racial",
    label: "Letramento Racial",
    subtitle: "Antirracismo, representatividade e diálogo",
    Icon: Megaphone,
    matchKeywords: ["letramento racial", "antirracismo", "representatividade", "diversidade"],
  },
  {
    id: "letramento-lgbtqa",
    label: "Letramento LGBTQA+",
    subtitle: "Diversidade, identidade e acolhimento",
    Icon: Heart,
    matchKeywords: ["lgbtqa+", "diversidade", "identidade", "acolhimento"],
  },
  {
    id: "autoconhecimento",
    label: "Autoconhecimento",
    subtitle: "Reflexão, propósito e desenvolvimento pessoal",
    Icon: Brain,
    matchKeywords: ["autoconhecimento", "reflexão", "propósito", "desenvolvimento pessoal"],
  },
  {
    id: "astrologia",
    label: "Astrologia",
    subtitle: "Mapas, signos e autoconhecimento pelas estrelas",
    Icon: Moon,
    matchKeywords: ["astrologia", "signos", "horóscopo", "mapa astral"],
  },
];
