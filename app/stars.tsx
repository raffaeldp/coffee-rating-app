// Read-only 5-star display supporting half stars (e.g. 3.5).
export function Stars({ value }: { value: number }) {
  return (
    <span className="stars-view" role="img" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star ${starFill(value, n)}`} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export const starFill = (value: number | null, n: number) =>
  value == null ? "" : value >= n ? "full" : value >= n - 0.5 ? "half" : "";
