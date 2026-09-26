export interface PagePlaceholderProps {
  title: string;
}

export default function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-4 font-serif text-2xl font-semibold text-night-900">{title}</h1>
      <p className="text-night-700">Cette page sera disponible prochainement.</p>
    </div>
  );
}
