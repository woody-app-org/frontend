import type { Community, CommunityCategory, JoinRequest, Membership, User } from "../types";

export interface SeedFollow {
  followerId: string;
  followingId: string;
}

/** Post bruto alinhado ao seed (autor expandido + `authorId` para DTO/API). */
export interface SeedPost {
  id: string;
  communityId: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  imageUrl: string | null;
  tags?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

/** Comentário persistido no mock (sem `author` expandido até o enrich). */
export interface SeedComment {
  id: string;
  postId: string;
  /** `null` = comentário raiz no post. */
  parentCommentId: string | null;
  authorId: string;
  content: string;
  /** ISO 8601. */
  createdAt: string;
}

const avatar = (id: string, sig: string) =>
  `https://images.unsplash.com/photo-${id}?w=120&h=120&fit=crop&${sig}`;
const cover = (id: string, sig: string) =>
  `https://images.unsplash.com/photo-${id}?w=1400&h=420&fit=crop&${sig}`;
const postImg = (id: string) => `https://images.unsplash.com/photo-${id}?w=720&h=480&fit=crop`;

const AVATAR_PHOTOS = [
  "1494790108377-be9c29b29330",
  "1438761681033-6461ffad8d80",
  "1544005313-94ddf0286df2",
  "1534528741775-53994a69daeb",
  "1529626455594-4ff0802cfb7e",
  "1508214751196-bcfd4f60ece2",
  "1517841905240-472988babdf9",
  "1487412720507-e7ed22a73c33",
  "1580489944761-15a19d654956",
  "1507003211169-0a1dd7228f2d",
  "1524504388940-b21c5f3d3eb3",
  "1573496359142-bdc877684a0",
  "1594742836364-fce0109e0e7f",
  "1509967419539-ba38bfbd2e",
  "1531746022778-eac3bf3666a",
  "1488426862026-f6c0c0b6c9b8",
  "1506794778202-cad84cf45f1d",
  "1525134474479-d3c3f4e0c0fe",
  "1582757388086-8c02b8b0b0c0",
  "1637416065966-e6c2a0f0b5c1",
  "1611677262466-fb43d57f4f7a",
  "1621590952484-26b51e5c5e9b",
  "1632163662646-8d0b2f0c2d3e",
  "1642250843557-7f0e3d4e6a8b",
];

const POST_IMAGES = [
  "1506905925346-21b8734f3e7b",
  "1516321497447-233866d3d0f5",
  "1529156069898-49905d2e0da5",
  "1523240791028-a9a3b8a8b8a8",
  "1470093851219-0c5b2b2b2b2b",
  "1469474968028-5662488a85b5",
  "1493612276216-ee4353200456",
  "1441974231531-621687eb8c0b",
  "1517245383107-b7e9a0b0b0b0",
];

const FIRST_NAMES = [
  "Ana",
  "Beatriz",
  "Camila",
  "Débora",
  "Elena",
  "Fernanda",
  "Gabriela",
  "Helena",
  "Isabela",
  "Juliana",
  "Larissa",
  "Marina",
  "Natália",
  "Patrícia",
  "Rafaela",
  "Sofia",
  "Talita",
  "Valentina",
  "Yasmin",
  "Lívia",
  "Manuela",
  "Priscila",
  "Renata",
  "Verônica",
];

const LAST_NAMES = [
  "Almeida",
  "Barbosa",
  "Costa",
  "Dias",
  "Ferreira",
  "Gomes",
  "Lima",
  "Martins",
  "Mendes",
  "Monteiro",
  "Nascimento",
  "Oliveira",
  "Pereira",
  "Ribeiro",
  "Rocha",
  "Santos",
  "Silva",
  "Souza",
  "Teixeira",
  "Vieira",
];

const TIME_LABELS = [
  "agora há pouco",
  "12 min atrás",
  "1h atrás",
  "2h atrás",
  "5h atrás",
  "ontem",
  "2h atrás",
  "3d atrás",
  "1 sem atrás",
  "4h atrás",
  "6h atrás",
  "8h atrás",
  "10h atrás",
  "1d atrás",
  "2d atrás",
];

const SNIPPETS_SHORT = [
  "Alguém mais sente que precisamos falar mais sobre isso sem julgamento?",
  "Compartilhando um recurso que me ajudou muito — espero que ajude vocês também.",
  "Bom dia! Queria um conselho rápido antes da reunião de hoje.",
  "Isso mudou minha rotina. Vale o experimento.",
  "Tó sensível: preciso de apoio para decidir o próximo passo.",
];

const SNIPPETS_LONG = [
  "Há meses venho equilibrando teletrabalho, filhos e um projeto paralelo. Não é sobre 'dar conta de tudo', e sim sobre escolher o que importa cada semana. Nesta semana coloquei limites claros no horário de mensagens — e, pela primeira vez, consegui terminar um curso que estava parado.\n\nSe estiverem na mesma fase: qual truque de fronteira (temporal ou emocional) funcionou para vocês?",
  "Saí de um ambiente tóxico na empresa anterior e a entrevista de ontem foi a primeira em que me senti autorizada a perguntar sobre cultura e diversidade de verdade, não só retórica. A recrutadora respondeu com exemplos concretos e isso fez toda a diferença no meu nervosismo.\n\nQuem estiver se preparando: anotem 3 perguntas não negociáveis e treinem em voz alta.",
  "Leitura do mês: narrativa em primeira pessoa que trata de luto e recomeço sem romantizar a dor. Chorei no capítulo 7 e me reconheci na protagonista — especialmente nas cenas em que ela pede ajuda e ainda assim sente culpa.\n\nSem spoilers: quem já leu, vale debater o final em um café virtual?",
  "Lista rápida do que aprendi em 6 meses de terapia em grupo: (1) nomear o que sinto antes de agir; (2) não competir sofrimento; (3) celebrar microvitórias. O espaço daqui da plataforma tem sido complementar a isso — obrigada às que responderam na thread anterior.",
];

const TEMPLATES: { title: string; tagPool: string[] }[] = [
  { title: "Como vocês fazem pausa digital no trabalho híbrido?", tagPool: ["rotina", "bem-estar", "trabalho"] },
  { title: "Indicação de curso acessível em UX research", tagPool: ["UX", "carreira", "estudos"] },
  { title: "Thread de leveza: o que te fez sorrir hoje?", tagPool: ["comunidade", "gentileza"] },
  { title: "Maternidade e sono: o que funcionou além do óbvio", tagPool: ["maternidade", "saúde"] },
  { title: "Segurança em apps de relacionamento — checklist", tagPool: ["segurança", "apoio"] },
  { title: "Vamos montar um grupinho de accountability?", tagPool: ["metas", "apoio"] },
  { title: "Relato: primeira palestra como mulher trans na empresa", tagPool: ["carreira", "visibilidade"] },
  { title: "Receitas de 20 min para noites corridas", tagPool: ["rotina", "cuidado"] },
  { title: "Livros com narrativa indígena ou afro-latina", tagPool: ["literatura", "cultura"] },
  { title: "Burnout: sinais que ignorei por muito", tagPool: ["saúde mental", "trabalho"] },
  { title: "Finanças afetivas — conversa difícil com parceira", tagPool: ["relacionamentos"] },
  { title: "Hackathon interno: times só de mulheres?", tagPool: ["tech", "liderança"] },
];

const COVER_PHOTOS = [
  "1522071820081-009f0129c71c",
  "1503454537195-1dcabb73ffb9",
  "1507003211169-0a1dd7228f2d",
  "1517694712202-14dd9538aa97",
  "1522202176988-66273c2fd55f",
  "1504384303080-2e62fcb0cf8a",
  "1490750967868-88aa4486c946",
  "1469474968028-566249934d85",
  "1441986300917-64674bd600d6",
  "1529333166437-af875ab6c358",
  "1517245383107-b7e9e0d7ee0f",
  "1501595080924-7481c5f2aa4b",
  "1516321310761-5c3fcb8e4d9f",
  "1556761175-b413da4baf72",
];

const COMMUNITY_SPECS: {
  slug: string;
  name: string;
  description: string;
  category: CommunityCategory;
  tags: string[];
}[] = [
  {
    slug: "mulheres-na-tech",
    name: "Mulheres na Tech",
    description:
      "Carreira, aprendizado e desafios no mercado de tecnologia — com espaço para iniciantes e referências.",
    category: "carreira",
    tags: ["programação", "carreira", "networking"],
  },
  {
    slug: "maternidade-acolhida",
    name: "Maternidade acolhida",
    description: "Conversas sobre maternidade, saúde mental e apoio mútuo entre mulheres.",
    category: "bemestar",
    tags: ["maternidade", "saúde mental", "apoio"],
  },
  {
    slug: "livros-e-historias",
    name: "Livros & histórias",
    description: "Indicações, clubes do livro e textos que inspiram — ficção, não ficção e poesia.",
    category: "cultura",
    tags: ["livros", "leitura", "escrita"],
  },
  {
    slug: "seguranca-na-cidade",
    name: "Segurança na cidade",
    description: "Dicas, relatos anônimos quando necessário e mapeamento colaborativo de apoio.",
    category: "seguranca",
    tags: ["segurança", "apoio", "rotas"],
  },
  {
    slug: "empreendedorismo-feminino",
    name: "Empreendedorismo feminino",
    description: "Da ideia ao primeiro cliente: finanças, jurídico básico e marketing com propósito.",
    category: "carreira",
    tags: ["negócios", "pitch", "finanças"],
  },
  {
    slug: "saude-mental-no-dia-a-dia",
    name: "Saúde mental no dia a dia",
    description: "Ansiedade, terapia, remédio sem tabu — sempre com acolhimento e sem conselho médico solto.",
    category: "bemestar",
    tags: ["terapia", "ansiedade", "apoio"],
  },
  {
    slug: "arte-musica-e-oficios",
    name: "Arte, música e ofícios",
    description: "Criadoras compartilham processo, materiais e oportunidades de mostras coletivas.",
    category: "cultura",
    tags: ["artes", "música", "maker"],
  },
  {
    slug: "lgbtqiap-nos-espacos-profissionais",
    name: "LGBTQIA+ nos espaços profissionais",
    description: "Rede para troca sobre afirmação de gênero, nomenclaturas e políticas de inclusão.",
    category: "carreira",
    tags: ["diversidade", "trabalho", "direitos"],
  },
  {
    slug: "corpo-movimento-e-alimentacao",
    name: "Corpo, movimento e alimentação",
    description: "Sem pilares de 'corpo ideal'. Foco em sensação, nutritividade intuitiva e prazer no movimento.",
    category: "bemestar",
    tags: ["movimento", "nutrição", "corpo"],
  },
  {
    slug: "viagens-sozinhas-e-em-grupo",
    name: "Viagens sozinhas e em grupo",
    description: "Roteiros, segurança, orçamento e encontros para viajar acompanhada por mulheres da rede.",
    category: "cultura",
    tags: ["viagem", "orçamento", "encontros"],
  },
  {
    slug: "estudos-e-concursos",
    name: "Estudos e concursos",
    description: "Grupos de foco, materiais compartilhados e accountability para quem concorre a vagas públicas.",
    category: "carreira",
    tags: ["estudos", "concursos", "rotina"],
  },
  {
    slug: "relacionamentos-e-limites",
    name: "Relacionamentos e limites",
    description: "Família escolhida, amizades e vínculos amorosos — conversas sobre comunicação e limites.",
    category: "bemestar",
    tags: ["relacionamentos", "limites", "afeto"],
  },
  {
    slug: "cuidadores-e-cuidadoras",
    name: "Cuidadores e cuidadoras",
    description: "Quem cuida de pais, avós ou parceiras com necessidades especiais — descanso e direitos.",
    category: "outro",
    tags: ["cuidado", "exaustão", "direitos"],
  },
  {
    slug: "mudancas-e-novos-comecos",
    name: "Mudanças e novos começos",
    description: "Trocar de cidade, país ou carreira: burocracia, solidão e celebração dos pequenos passos.",
    category: "outro",
    tags: ["mudança", "recomeço", "apoio"],
  },
];

function hash(i: number, j: number): number {
  return (i * 17 + j * 31) % 997;
}

function buildUsers(): User[] {
  const users: User[] = [];
  for (let i = 0; i < 24; i++) {
    const id = String(i + 1);
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
    const name = i === 0 ? "Seu nome" : `${fn} ${ln}`;
    const username = i === 0 ? "seunome" : `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, "")}${i > 12 ? i : ""}`;
    const avId = AVATAR_PHOTOS[i % AVATAR_PHOTOS.length];
    const bios = [
      "Facilitadora de squads e mãe de dois gatos.",
      "Engenheira de dados; leio ficção científica nas férias.",
      "Psicóloga em formação; amo debates sobre consentimento.",
      "Designer que troca receitas vegetarianas por feedback de portfólio.",
      "Enfermeira, maratonista aos finais de semana.",
      "Historiadora e podcast sobre autoras esquecidas.",
      "Advogada trabalhista; café forte e agendas coloridas.",
      "Ilustradora freelance — aceito encomendas com calma e prazo honesto.",
      "Product manager em healthtech; estudo línguas mortas por hobby.",
      "Jornalista investigativa em transição para ONG.",
    ];
    users.push({
      id,
      name,
      username,
      avatarUrl: avatar(avId, `sig=${id}`),
      bio: bios[i % bios.length],
      pronouns: "ela/dela",
    });
  }
  return users;
}

function buildSeedCommentsForPosts(
  posts: SeedPost[],
  authorsByCommunity: Map<string, string[]>
): SeedComment[] {
  const COMMENT_TOPICS = [
    ...SNIPPETS_SHORT,
    "Concordo plenamente — obrigada por compartilhar.",
    "Vou testar isso na próxima semana e volto com feedback.",
    "Tem algum link ou material de apoio?",
    "Mesma dúvida aqui, acompanhando a thread.",
    "🙌 Isso normaliza demais o que estou sentindo.",
    "Respondendo aqui: faz sentido, obrigada por abrir o tema.",
    "Subindo um nível: também passo por algo parecido.",
    "Concordo em partes — vale um café virtual pra destrinchar.",
  ];
  const comments: SeedComment[] = [];
  let cid = 0;

  for (const post of posts) {
    const pool = authorsByCommunity.get(post.communityId) ?? [post.authorId];
    const volume = Math.max(
      0,
      Math.min(post.commentsCount, 2 + (hash(post.id.length, 7) % 12))
    );
    const rootsThisPost: SeedComment[] = [];

    for (let j = 0; j < volume; j += 1) {
      cid += 1;
      const authorId = pool[(hash(cid, j) + post.id.length) % pool.length];
      const hoursAgo = j * 3 + (hash(cid, 5) % 20);
      const createdAt = new Date(
        Date.now() - hoursAgo * 3_600_000 - (hash(cid, 3) % 3600) * 1000
      ).toISOString();
      const root: SeedComment = {
        id: `cmt-${post.id}-r-${j + 1}`,
        postId: post.id,
        parentCommentId: null,
        authorId,
        content: COMMENT_TOPICS[(hash(cid, j * 2) + j) % COMMENT_TOPICS.length],
        createdAt,
      };
      comments.push(root);
      rootsThisPost.push(root);
    }

    /** Threads moderadas: respostas e, em alguns posts, um terceiro nível. */
    if (rootsThisPost.length === 0) continue;
    const threadSalt = hash(post.id.length, 11);
    if (threadSalt % 5 >= 3) continue;

    const firstRoot = rootsThisPost[0];
    const replyAuthor1 = pool[(hash(post.id.length, 2) + 1) % pool.length];
    const tReply1 = new Date(new Date(firstRoot.createdAt).getTime() + (3 + (threadSalt % 5)) * 60_000).toISOString();
    const reply1: SeedComment = {
      id: `cmt-${post.id}-re-${firstRoot.id}-a`,
      postId: post.id,
      parentCommentId: firstRoot.id,
      authorId: replyAuthor1,
      content: COMMENT_TOPICS[(hash(cid + 1, 8) + 1) % COMMENT_TOPICS.length],
      createdAt: tReply1,
    };
    comments.push(reply1);

    if (rootsThisPost.length >= 2 && threadSalt % 2 === 0) {
      const secondRoot = rootsThisPost[1];
      const replyAuthor2 = pool[(hash(post.id.length, 4) + 2) % pool.length];
      const tReply2 = new Date(new Date(secondRoot.createdAt).getTime() + 8 * 60_000).toISOString();
      comments.push({
        id: `cmt-${post.id}-re-${secondRoot.id}-a`,
        postId: post.id,
        parentCommentId: secondRoot.id,
        authorId: replyAuthor2,
        content: COMMENT_TOPICS[(hash(cid + 2, 9) + 2) % COMMENT_TOPICS.length],
        createdAt: tReply2,
      });
    }

    if (threadSalt % 4 === 0) {
      const replyAuthor3 = pool[(hash(post.id.length, 6) + 3) % pool.length];
      const tDeep = new Date(new Date(reply1.createdAt).getTime() + 6 * 60_000).toISOString();
      comments.push({
        id: `cmt-${post.id}-re-${reply1.id}-b`,
        postId: post.id,
        parentCommentId: reply1.id,
        authorId: replyAuthor3,
        content: COMMENT_TOPICS[(hash(cid + 3, 4) + 3) % COMMENT_TOPICS.length],
        createdAt: tDeep,
      });
    }
  }

  return comments;
}

export function buildPlatformSeed(): {
  users: User[];
  communities: Community[];
  memberships: Membership[];
  follows: SeedFollow[];
  posts: SeedPost[];
  postComments: SeedComment[];
  joinRequests: JoinRequest[];
} {
  const users = buildUsers();
  const communities: Community[] = COMMUNITY_SPECS.map((spec, idx) => ({
    id: `c-${String(idx + 1).padStart(2, "0")}`,
    slug: spec.slug,
    name: spec.name,
    description: spec.description,
    category: spec.category,
    tags: spec.tags,
    avatarUrl: avatar(AVATAR_PHOTOS[(idx * 3) % AVATAR_PHOTOS.length], `c=${spec.slug}`),
    coverUrl: cover(COVER_PHOTOS[idx % COVER_PHOTOS.length], `cv=${spec.slug}`),
    /** Duas primeiras comunidades criadas pela usuária seed "1"; demais espalham donas. */
    ownerUserId: idx < 2 ? "1" : String(((idx + 3) % 18) + 1),
    visibility: idx % 3 === 1 ? "private" : "public",
    memberCount: 0,
    rules:
      idx === 0
        ? "Compartilhe oportunidades com contexto e respeito.\nEvite spam e mensagens privadas não solicitadas."
        : "",
  }));
  const memberships: Membership[] = [];
  let mid = 0;

  const memberMap = new Map<string, Set<string>>();
  for (const c of communities) {
    memberMap.set(c.id, new Set());
  }

  for (const c of communities) {
    const set = memberMap.get(c.id)!;
    if (set.has(c.ownerUserId)) continue;
    set.add(c.ownerUserId);
    mid += 1;
    memberships.push({
      id: `m-${mid}`,
      userId: c.ownerUserId,
      communityId: c.id,
      role: "owner",
      status: "active",
      joinedAt: `2020-${String((mid % 12) + 1).padStart(2, "0")}-01`,
    });
  }

  for (let u = 0; u < users.length; u++) {
    const userId = users[u].id;
    const n = 3 + (hash(u, 0) % 4);
    const started = (u * 5) % communities.length;
    for (let k = 0; k < n; k++) {
      const cIdx = (started + k * 2) % communities.length;
      const comm = communities[cIdx];
      if (comm.ownerUserId === userId) continue;
      const set = memberMap.get(comm.id)!;
      if (set.has(userId)) continue;
      set.add(userId);
      mid += 1;
      memberships.push({
        id: `m-${mid}`,
        userId,
        communityId: comm.id,
        role: hash(u, k) % 11 === 0 ? "admin" : "member",
        status: "active",
        joinedAt: `${2019 + ((u + k) % 5)}-${String(((u + k) % 12) + 1).padStart(2, "0")}-15`,
      });
    }
  }

  const maternidade = communities[1];
  for (let i = memberships.length - 1; i >= 0; i--) {
    const m = memberships[i];
    if (m.communityId === maternidade.id && (m.userId === "4" || m.userId === "5")) {
      const set = memberMap.get(m.communityId);
      set?.delete(m.userId);
      memberships.splice(i, 1);
    }
  }

  const banned = memberships.find((m) => m.userId === "10" && m.communityId === communities[0].id);
  if (banned) {
    banned.status = "banned";
    memberMap.get(banned.communityId)?.delete("10");
  }

  /** Pedido pendente só em membership (sem join request) — cenário alternativo ao jr-*. */
  const livrosCommunity = communities[2];
  const pendingUserId = "11";
  const pendingMem = memberships.find((m) => m.userId === pendingUserId && m.communityId === livrosCommunity.id);
  if (pendingMem) pendingMem.status = "pending";

  const jr3Community = communities[4];
  for (let i = memberships.length - 1; i >= 0; i--) {
    const m = memberships[i];
    if (m.communityId === jr3Community.id && m.userId === "6" && m.role !== "owner") {
      memberships.splice(i, 1);
    }
  }

  for (const c of communities) {
    c.memberCount = memberships.filter((m) => m.communityId === c.id && m.status === "active").length;
  }

  const joinRequests: JoinRequest[] = [
    {
      id: "jr-1",
      communityId: maternidade.id,
      userId: "4",
      status: "pending",
      requestedAt: "2024-11-01T10:00:00.000Z",
    },
    {
      id: "jr-2",
      communityId: maternidade.id,
      userId: "5",
      status: "rejected",
      requestedAt: "2024-10-15T08:00:00.000Z",
    },
    {
      id: "jr-3",
      communityId: communities[4].id,
      userId: "6",
      status: "pending",
      requestedAt: "2024-11-20T14:00:00.000Z",
    },
  ];

  const follows: SeedFollow[] = [];
  const viewer = "1";
  const followTargets = [2, 5, 7, 8, 12, 15, 18, 21, 4, 11];
  for (const t of followTargets) {
    follows.push({ followerId: viewer, followingId: String(t) });
  }
  for (let a = 2; a <= 8; a++) {
    for (let b = 1; b <= 3; b++) {
      const tgt = ((a * 4 + b) % 20) + 2;
      if (String(a) !== String(tgt))
        follows.push({ followerId: String(a), followingId: String(tgt) });
    }
  }

  const authorsByCommunity = new Map<string, string[]>();
  for (const m of memberships) {
    if (m.status !== "active") continue;
    const list = authorsByCommunity.get(m.communityId) ?? [];
    list.push(m.userId);
    authorsByCommunity.set(m.communityId, list);
  }
  for (const c of communities) {
    if ((authorsByCommunity.get(c.id)?.length ?? 0) === 0) {
      authorsByCommunity.set(c.id, ["1", "2", "3"]);
    }
  }

  const userById = new Map(users.map((u) => [u.id, u]));
  const pickAuthor = (communityId: string, salt: number): User => {
    const pool = authorsByCommunity.get(communityId) ?? ["1"];
    const id = pool[salt % pool.length];
    return userById.get(id)!;
  };

  const posts: SeedPost[] = [];
  let pid = 0;

  for (let i = 0; i < 88; i++) {
    const c = communities[i % communities.length];
    const author = pickAuthor(c.id, hash(i, 3));
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const useLong = i % 7 === 0 || i % 11 === 0;
    const useImage = i % 3 !== 0;
    const content = useLong
      ? SNIPPETS_LONG[i % SNIPPETS_LONG.length]
      : `${SNIPPETS_SHORT[i % SNIPPETS_SHORT.length]}\n\n${tpl.title}`;

    pid += 1;
    const baseEngagement = 8 + hash(i, 9) * 13 + (i % 5) * 40;
    posts.push({
      id: `post-${pid}`,
      communityId: c.id,
      authorId: author.id,
      author,
      title: i % 4 === 0 ? tpl.title : `${tpl.title} · #${i + 1}`,
      content,
      imageUrl: useImage ? postImg(POST_IMAGES[i % POST_IMAGES.length]) : null,
      tags: [tpl.tagPool[0], tpl.tagPool[hash(i, 2) % tpl.tagPool.length]],
      createdAt: TIME_LABELS[i % TIME_LABELS.length],
      likesCount: Math.min(4800, baseEngagement + (i % 17) * 111),
      commentsCount: Math.min(420, 2 + hash(i, 1) * 3 + (i % 9) * 7),
    });
  }

  /** Garantir volume para a usuária visual principal. */
  const viewerCommunityIds = memberships
    .filter((m) => m.userId === "1" && m.status === "active")
    .map((m) => m.communityId);
  for (let j = 0; j < 12; j++) {
    if (viewerCommunityIds.length === 0) break;
    const cId = viewerCommunityIds[j % viewerCommunityIds.length];
    pid += 1;
    posts.push({
      id: `post-u1-${j}`,
      communityId: cId,
      authorId: "1",
      author: userById.get("1")!,
      title: j % 2 === 0 ? "Notas da semana na Woody" : "Atualização rápida para quem acompanha",
      content:
        j % 2 === 0
          ? "Compilando threads que mais me ajudaram — em breve respondo as dúvidas que ficaram pendentes."
          : "Obrigada pelas mensagens. Este espaço tem sido um dos poucos onde consigo falar com clareza sobre o que estou vivendo.",
      imageUrl: j % 3 === 0 ? postImg(POST_IMAGES[j % POST_IMAGES.length]) : null,
      tags: ["comunidade", "atualização"],
      createdAt: TIME_LABELS[(j + 3) % TIME_LABELS.length],
      likesCount: 40 + j * 17,
      commentsCount: 5 + j * 2,
    });
  }

  const postComments = buildSeedCommentsForPosts(posts, authorsByCommunity);
  const countByPost = new Map<string, number>();
  for (const c of postComments) {
    countByPost.set(c.postId, (countByPost.get(c.postId) ?? 0) + 1);
  }
  for (const p of posts) {
    p.commentsCount = countByPost.get(p.id) ?? 0;
  }

  return { users, communities, memberships, follows, posts, postComments, joinRequests };
}
