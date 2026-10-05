export interface FormAlertProps {
  message: string;
  onDismiss: () => void;
}

export function FormAlert({ message, onDismiss }: FormAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-md bg-red-100 p-3 text-sm text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="shrink-0 text-red-800 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
      >
        ✕
      </button>
    </div>
  );
}
