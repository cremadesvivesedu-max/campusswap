"use client";

// Inline styles: this button lives on the offline page, where the CSS file is missing.
export function RetryButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      style={{
        marginTop: 8,
        border: 0,
        borderRadius: 999,
        padding: "12px 24px",
        background: "#3db070",
        color: "#0f172a",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}
