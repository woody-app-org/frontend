import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AtSign,
  CheckCircle,
  Facebook,
  Instagram,
  Loader2,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import woodyCat from "@/assets/new-cat.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  submitPreLaunchSignup,
  type SocialNetwork,
} from "../services/prelaunch.service";

type SocialOption = {
  value: SocialNetwork;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
};

const SOCIAL_OPTIONS: SocialOption[] = [
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "seuinsta",
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    value: "x",
    label: "X / Twitter",
    placeholder: "seuusuario",
    icon: <Twitter className="w-4 h-4" />,
  },
  {
    value: "threads",
    label: "Threads",
    placeholder: "seuthreads",
    icon: <AtSign className="w-4 h-4" aria-hidden />,
  },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "seuface",
    icon: <Facebook className="w-4 h-4" />,
  },
];

function getOption(value: SocialNetwork | null) {
  return SOCIAL_OPTIONS.find((o) => o.value === value) ?? null;
}

const WAITLIST_INTRO_SEGMENTS = [
  "Oi, futura Woody! Bem-vinda à lista de interesse para fazer parte da nossa comunidade.",
  "Por enquanto, esta inscrição serve apenas para mapear o interesse inicial pela plataforma.",
  "O lançamento oficial será anunciado em breve pelas redes da Woody e da Sapatone_.",
  "Neste formulário, pedimos somente seu nome e o username de uma rede social da sua escolha. A validação de perfis reais, alinhados ao nosso público-alvo, é uma premissa importante para a Woody.",
  "Siga nossos perfis no Instagram para ficar por dentro da data em que a Woody — sua nova rede social sáfica — será lançada.",
] as const;

const WAITLIST_INTRO_FORM = WAITLIST_INTRO_SEGMENTS[0];
const WAITLIST_INTRO_SUCCESS_BODY = WAITLIST_INTRO_SEGMENTS.slice(1);

const schema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(120, "Nome deve ter no máximo 120 caracteres."),
  socialNetwork: z.enum(["instagram", "x", "threads", "facebook"], {
    message: "Selecione uma rede social.",
  }),
  socialUsername: z
    .string()
    .min(1, "Usuário é obrigatório.")
    .max(80, "Usuário deve ter no máximo 80 caracteres."),
  website: z.string(),
});

type FormData = z.infer<typeof schema>;

export function WaitlistFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      socialUsername: "",
      website: "",
    },
  });

  const selectedNetwork = useWatch({ control, name: "socialNetwork" });
  const currentOption = getOption(selectedNetwork ?? null);

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await submitPreLaunchSignup({
        name: data.name.trim(),
        socialNetwork: data.socialNetwork,
        socialUsername: data.socialUsername.trim().replace(/^@+/, ""),
        acceptedContact: true,
        website: data.website ?? "",
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Algo deu errado. Tente novamente."
      );
    }
  }

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-[var(--woody-sand)] flex flex-col">
      <header className="pt-12 pb-2 flex justify-center sm:pt-14">
        <WoodyCatLogo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">
          <div className="mb-5 px-1 text-left">
            <p className="text-base font-bold text-[var(--woody-ink)]/75 leading-snug">
              {WAITLIST_INTRO_FORM}
            </p>
          </div>

          <div className="mb-8 text-center px-2">
            <h1 className="text-[1.75rem] font-bold text-[var(--woody-ink)] leading-[1.2] tracking-tight">
              Preencha seus dados aqui!
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
              <Field label="Nome" error={errors.name?.message}>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  maxLength={120}
                  {...register("name")}
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck
                  className={inputCls(!!errors.name)}
                />
              </Field>

              <Field label="Rede social" error={errors.socialNetwork?.message}>
                <Controller
                  name="socialNetwork"
                  control={control}
                  render={({ field }) => {
                    const selected = getOption(field.value ?? null);
                    return (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={inputCls(!!errors.socialNetwork)}
                          aria-label="Selecione uma rede social"
                        >
                          {selected ? (
                            <div className="flex min-w-0 flex-1 items-center gap-2.5 text-sm text-[var(--woody-ink)]">
                              <span className="flex shrink-0 items-center text-[var(--woody-ink)]/70">
                                {selected.icon}
                              </span>
                              <span className="min-w-0 truncate">
                                {selected.label}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground font-normal">
                              Selecione uma rede
                            </div>
                          )}
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl overflow-hidden">
                          {SOCIAL_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="cursor-pointer rounded-xl"
                            >
                              <div className="flex w-full min-w-0 items-center gap-2.5">
                                <span className="flex shrink-0 items-center text-[var(--woody-ink)]/60">
                                  {opt.icon}
                                </span>
                                <span className="min-w-0 truncate">{opt.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </Field>

              <Field
                label="Seu usuário nessa rede"
                error={errors.socialUsername?.message}
              >
                <div
                  className={cn(
                    "flex h-11 min-w-0 items-stretch overflow-hidden rounded-xl border bg-background transition-colors",
                    errors.socialUsername
                      ? "border-red-400 ring-red-400/30"
                      : "border-black/10 focus-within:border-[var(--woody-lime)] focus-within:ring-[var(--woody-lime)]/20 focus-within:ring-[3px]"
                  )}
                >
                  <span
                    className="flex shrink-0 items-center border-r border-black/10 bg-[var(--woody-sand)]/80 px-3 text-base font-semibold text-[var(--woody-ink)]/55 select-none"
                    aria-hidden
                  >
                    @
                  </span>
                  <Input
                    id="socialUsername"
                    placeholder={currentOption?.placeholder ?? "seuusuario"}
                    maxLength={80}
                    {...register("socialUsername")}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="text"
                    translate="no"
                    className="h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </Field>

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden opacity-0"
                {...register("website")}
              />

              {serverError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 leading-snug">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-[0.9375rem] font-semibold rounded-2xl bg-[var(--woody-lime)] hover:bg-[var(--woody-lime)] hover:brightness-95 active:scale-[0.985] text-[var(--woody-ink)] border-0 transition-all duration-150 mt-1 shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />
                ) : null}
                Enviar
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-[var(--woody-ink)]/30">
            Seus dados não serão compartilhados.
          </p>
        </div>
      </main>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-[var(--woody-sand)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center mb-2">
          <WoodyCatLogo className="h-24 sm:h-28" />
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--woody-lime)]/15 flex items-center justify-center">
              <CheckCircle
                className="w-9 h-9 text-[var(--woody-lime)]"
                strokeWidth={1.75}
              />
            </div>
          </div>

          <div className="space-y-2.5 text-left">
            {WAITLIST_INTRO_SUCCESS_BODY.map((segment, i) => (
              <p
                key={i}
                className="text-[var(--woody-ink)]/70 text-sm leading-[1.5]"
              >
                {segment}
              </p>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--woody-lime)]" />
            <span className="text-xs text-[var(--woody-ink)]/40">
              Woody · Pré-lançamento
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--woody-lime)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[var(--woody-ink)]">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `h-11 rounded-xl border transition-colors ${
    hasError
      ? "border-red-400 focus-visible:ring-red-400/30"
      : "border-black/10 focus-visible:border-[var(--woody-lime)] focus-visible:ring-[var(--woody-lime)]/20"
  }`;
}

function WoodyCatLogo({ className }: { className?: string }) {
  return (
    <img
      src={woodyCat}
      alt="Woody"
      className={cn(
        "h-[7rem] w-auto max-w-[min(94vw,22rem)] object-contain object-center select-none sm:h-[8rem] md:h-[8.5rem]",
        className
      )}
      width={1598}
      height={1443}
      decoding="async"
      draggable={false}
    />
  );
}
