export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl sm:mb-16 text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold text-brand-forest sm:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">{subtitle}</p>
    </div>
  );
}
