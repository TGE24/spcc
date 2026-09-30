"use client";
// Opens the browser's print dialog, which also offers "Save as PDF" — so a
// printable page doubles as a PDF download with no PDF library needed.
export function PrintButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
