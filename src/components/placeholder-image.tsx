import fs from "node:fs";
import path from "node:path";

// Renders the real photo if you've dropped one into public/images/<slot>.jpg,
// otherwise a labeled placeholder block — so pages look intentional even
// before real photography is added, and swapping in the real photo later
// needs zero code changes. See public/images/README.md.
export function PlaceholderImage({
  slot,
  label,
  className,
}: {
  slot: string;
  label: string;
  className?: string;
}) {
  const filePath = path.join(process.cwd(), "public", "images", `${slot}.jpg`);
  const exists = fs.existsSync(filePath);

  if (exists) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/images/${slot}.jpg`} alt={label} className={`object-cover ${className ?? ""}`} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-200 p-4 text-center ${className ?? ""}`}
    >
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="mt-1 text-xs text-gray-400">Add public/images/{slot}.jpg</p>
      </div>
    </div>
  );
}
