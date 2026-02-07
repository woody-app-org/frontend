import { Post } from "@/components/post-component/Post";
import { PostComponent } from "@/components/post-component/PostComponent";

const posts: Post[] = [
  {
    authorName: "Débora da Silva",
    authorPic: "https://i.pravatar.cc/150?img=47",
    createdAt: "2026-02-04T14:10:00Z",
    description:
      "Vocês também sentem dificuldade em se posicionar em discussões online sem que tudo vire ataque pessoal? Às vezes parece que discordar virou sinônimo de brigar. Queria muito ouvir como vocês lidam com isso.",
    tags: ["Discussão", "Comunidade", "Opinião"],
    likes: 37,
  },
  {
    authorName: "Luisa Almeida",
    authorPic: "https://i.pravatar.cc/150?img=12",
    createdAt: "2026-02-04T09:45:00Z",
    description:
      "Comecei a escrever todos os dias por 10 minutos e fiquei surpresa com o quanto isso ajudou minha ansiedade. Não resolve tudo, mas muda bastante o ritmo da cabeça.",
    tags: ["SaúdeMental", "Rotina"],
    likes: 84,
  },
  {
    authorName: "Marina Costa",
    authorPic: "https://i.pravatar.cc/150?img=32",
    createdAt: "2026-02-03T22:18:00Z",
    description:
      "Nem todo silêncio é falta de argumento. Às vezes é só cansaço.",
    tags: ["Reflexão"],
    likes: 152,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      {posts.map((post, index) => (
        <PostComponent key={index} post={post} />
      ))}
    </main>
  );
}
