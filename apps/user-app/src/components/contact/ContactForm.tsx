import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Textarea } from "@chapelle/shared/ui";
import type { ContactMessageDto } from "../../api/endpoints/contact";

export interface ContactFormProps {
  isSubmitting: boolean;
  onSubmit: (dto: ContactMessageDto) => void;
}

// Options reprises telles quelles du gabarit legacy (`legacy-template/pages/Contact.tsx`) —
// convention purement front, `sujet` n'est modélisé que comme `string` libre par `ContactMessageDto`.
const SUJET_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Choisissez un sujet" },
  { value: "info", label: "Demande d'information" },
  { value: "priere", label: "Intention de prière" },
  { value: "visite", label: "Visite de groupe" },
  { value: "benevolat", label: "Bénévolat" },
  { value: "autre", label: "Autre" },
];

/** Reprend `.trim()` avant chaque `.min()` : le gabarit legacy valide sur `form.champ.trim()`
 *  (un nom/message composé uniquement d'espaces est rejeté) — Zod reproduit ce comportement
 *  et, en prime, envoie au mock des valeurs déjà nettoyées. */
function buildContactFormSchema(): z.ZodSchema<ContactMessageDto> {
  return z.object({
    nom: z.string().trim().min(1, "Le nom est requis."),
    email: z.string().trim().min(1, "L'email est requis.").email("Email invalide."),
    sujet: z.string().min(1, "Veuillez choisir un sujet."),
    message: z.string().trim().min(1, "Le message est requis.").min(10, "Minimum 10 caractères."),
  });
}

type ContactFormValues = z.infer<ReturnType<typeof buildContactFormSchema>>;

/** Pas de `reset()` explicite : `PageContact` démonte `ContactForm` pendant l'affichage de
 *  la confirmation puis le remonte au clic sur « Nouveau message » — un composant remonté
 *  repart de `defaultValues` vides sans code de reset dédié. */
export function ContactForm({ isSubmitting, onSubmit }: ContactFormProps) {
  const schema = buildContactFormSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: "", email: "", sujet: "", message: "" },
  });

  function submit(values: ContactFormValues): void {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Nom" placeholder="Votre nom" error={errors.nom?.message} {...register("nom")} />
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.fr"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <Select label="Sujet" options={SUJET_OPTIONS} error={errors.sujet?.message} {...register("sujet")} />
      <Textarea
        label="Message"
        rows={5}
        placeholder="Votre message..."
        error={errors.message?.message}
        {...register("message")}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Envoyer le message
      </Button>
    </form>
  );
}
