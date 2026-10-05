# Design — bandeau-erreur-formulaires-creation

## Composant `FormAlert` (packages/shared/src/ui)

```tsx
export interface FormAlertProps {
  message: string;
  onDismiss: () => void;
}

export function FormAlert({ message, onDismiss }: FormAlertProps) {
  return (
    <div role="alert" className="flex items-start justify-between gap-3 rounded-md bg-red-100 p-3 text-sm text-red-800">
      <p>{message}</p>
      <button type="button" onClick={onDismiss} aria-label="Fermer" className="shrink-0 text-red-800 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded">
        ✕
      </button>
    </div>
  );
}
```

- Palette `bg-red-100`/`text-red-800` : reprend exactement la variante `danger` déjà utilisée par
  `Badge` (cohérence visuelle avec le reste du kit), plutôt qu'un nouveau ton.
- Pas de variantes `success`/`info`/`warning` : seul le cas erreur est demandé ; `Toast` reste le
  mécanisme pour les autres cas. Pas de sur-conception.
- Pas d'auto-dismiss (`setTimeout`) : fermeture manuelle uniquement, conformément à la clarification
  utilisateur.
- Un seul message à la fois par formulaire (pas de liste empilée comme `Toast`) : une nouvelle erreur
  remplace la précédente, cohérent avec un formulaire qui ne peut être soumis qu'une fois à la fois.

## `RegisterForm.tsx`

```tsx
const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

async function onSubmit(values: RegisterFormValues): Promise<void> {
  setApiErrorMessage(null);
  // ... construction de dto/photo inchangée
  try {
    const response = await registerUser(dto, photo);
    onSuccess(response);
  } catch (error) {
    if (error instanceof ApiError) {
      setApiErrorMessage(error.message || GENERIC_ERROR_MESSAGE);
      return;
    }
    show(GENERIC_ERROR_MESSAGE, "error"); // inchangé : cas non-ApiError, très rare
  }
}
```
`<FormAlert>` rendu en premier enfant de `<form>`, avant le champ Email, uniquement si
`apiErrorMessage` est non nul.

## `UserForm.tsx` (mode `create`)

`CreateUserFormProps` étendu :
```ts
apiErrorMessage?: string | null;
onDismissError?: () => void;
```
`CreateUserForm` rend `<FormAlert>` en premier enfant du `<form>` si `apiErrorMessage` est fourni et
non nul, avec `onDismiss={onDismissError}`. Props optionnelles (défaut `undefined` → pas de bandeau)
pour ne pas casser un éventuel autre consommateur futur de `UserForm` mode `create` qui ne passerait
pas encore ces props.

## `useCreateUser.ts`

Retrait du bloc `onError` (toast). Le hook ne gère plus que `onSuccess` (toast succès + invalidation
`["users"]`). Les erreurs redeviennent visibles aux appelants via l'objet retourné par `useMutation`
(`createUser.error`, de type `ApiError`) et/ou le callback `onError` passé localement à
`createUser.mutate(...)` par chaque appelant.

## `PageGestionUtilisateurs.tsx` / `AdminCreatePage.tsx`

```tsx
const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

function handleCreateSubmit(dto: CreateUserRequest, photo?: File): void {
  setApiErrorMessage(null);
  createUser.mutate(
    { dto, photo },
    {
      onSuccess: () => { /* inchangé */ },
      onError: (error) => {
        setApiErrorMessage(error.message || "Une erreur est survenue, veuillez réessayer.");
      },
    },
  );
}
```
`apiErrorMessage`/`onDismissError={() => setApiErrorMessage(null)}` transmis à `<UserForm>`. Dans
`PageGestionUtilisateurs.tsx`, `apiErrorMessage` est aussi réinitialisé à la fermeture de la modale
(`onClose`/`onCancel`), pour ne pas réafficher une vieille erreur à la prochaine ouverture.
