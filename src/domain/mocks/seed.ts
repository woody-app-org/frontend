import type { Community, Membership, User } from "../types";

/**
 * Fonte única de verdade para mocks de usuárias, comunidades, participações e posts.
 * Serviços devem derivar listagens/paginação a partir daqui, sem duplicar objetos de post.
 */
export const SEED_USERS: User[] = [
  {
    id: "1",
    name: "Seu nome",
    username: "seunome",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    bio: "Professora e entusiasta de tecnologia.",
    pronouns: "ela/dela",
  },
  {
    id: "2",
    name: "Débora da Silva",
    username: "debora.silva",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    bio: "Dev e leitora voraz.",
    pronouns: "ela/dela",
  },
  {
    id: "3",
    name: "Marina Costa",
    username: "marina.costa",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    bio: "Apoio emocional e maternidade.",
    pronouns: "ela/dela",
  },
];

export const SEED_COMMUNITIES: Community[] = [
  {
    id: "c-tech",
    slug: "mulheres-na-tech",
    name: "Mulheres na Tech",
    description:
      "Espaço para dividir carreira, aprendizado e desafios no mercado de tecnologia com outras mulheres.",
    category: "carreira",
    tags: ["programação", "carreira", "networking"],
    avatarUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop",
    memberCount: 2,
  },
  {
    id: "c-mat",
    slug: "maternidade-acolhida",
    name: "Maternidade acolhida",
    description:
      "Conversas seguras sobre maternidade, saúde mental e apoio mútuo entre mulheres.",
    category: "bemestar",
    tags: ["maternidade", "saúde mental", "apoio"],
    avatarUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=100&h=100&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop",
    memberCount: 2,
  },
  {
    id: "c-livros",
    slug: "livros-e-historias",
    name: "Livros & histórias",
    description: "Indicações, clubes do livro e textos que inspiram.",
    category: "cultura",
    tags: ["livros", "leitura", "escrita"],
    avatarUrl: "https://images.unsplash.com/photo-1516979187457-6376994c6200?w=100&h=100&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
    memberCount: 3,
  },
];

export const SEED_MEMBERSHIPS: Membership[] = [
  { id: "m-1", userId: "1", communityId: "c-tech", role: "member" },
  { id: "m-2", userId: "1", communityId: "c-mat", role: "member" },
  { id: "m-3", userId: "1", communityId: "c-livros", role: "member" },
  { id: "m-4", userId: "2", communityId: "c-tech", role: "member" },
  { id: "m-5", userId: "2", communityId: "c-livros", role: "member" },
  { id: "m-6", userId: "3", communityId: "c-mat", role: "member" },
  { id: "m-7", userId: "3", communityId: "c-livros", role: "moderator" },
];

const u = (id: string) => SEED_USERS.find((x) => x.id === id)!;

/** Posts crus (sem preview de comunidade); use os selectors para enriquecer. */
export const SEED_POSTS = [
  {
    id: "post-1",
    communityId: "c-livros",
    author: u("1"),
    title: "Livro e café",
    content: "Um bom livro e um café quentinho — assim começo o dia com calma :)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    tags: ["rotina"],
    createdAt: "2h atrás",
    likesCount: 3500,
    commentsCount: 3500,
  },
  {
    id: "post-2",
    communityId: "c-tech",
    author: u("2"),
    title: "Primeira entrevista em tech depois da transição",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus potenti sagittis lacus tempor — alguém mais nervosa na véspera?",
    imageUrl: null,
    tags: ["carreira"],
    createdAt: "2h atrás",
    likesCount: 42,
    commentsCount: 12,
  },
  {
    id: "post-3",
    communityId: "c-livros",
    author: u("1"),
    title: "Clube do livro do mês",
    content: "Propomos leitura coletiva de uma autora contemporânea. Quem topa?",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop",
    tags: ["clube"],
    createdAt: "5h atrás",
    likesCount: 1200,
    commentsCount: 89,
  },
  {
    id: "post-4",
    communityId: "c-mat",
    author: u("3"),
    title: "Sono fragmentado e culpa",
    content:
      "Queria um espaço para falar sem julgamento sobre como o sono mudou tudo — e como pedir ajuda.",
    imageUrl: null,
    tags: ["apoio"],
    createdAt: "1d atrás",
    likesCount: 210,
    commentsCount: 45,
  },
  {
    id: "post-5",
    communityId: "c-tech",
    author: u("1"),
    title: "Mentoria informal em frontend",
    content: "Abri uma thread para trocarmos portfólios e feedbacks construtivos nesta semana.",
    imageUrl: null,
    tags: ["mentoria", "frontend"],
    createdAt: "3h atrás",
    likesCount: 88,
    commentsCount: 34,
  },
  {
    id: "post-6",
    communityId: "c-livros",
    author: u("3"),
    title: "Fantasia com protagonistas mulheres",
    content: "Indiquem suas autoras favoritas — quero montar uma lista para o grupo.",
    imageUrl: null,
    tags: ["indicações"],
    createdAt: "6h atrás",
    likesCount: 156,
    commentsCount: 67,
  },
] as const;

export type SeedPost = (typeof SEED_POSTS)[number];
