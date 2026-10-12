// Escudo del equipo: iniciales sobre un degradado cuyo color depende del id del equipo
export function TeamCrest({
  id,
  name,
  size = 40,
}: {
  id: number | string;
  name: string;
  size?: number;
}) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = (
    words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2)
  ).toUpperCase();
  const hue = (Number(id) * 47) % 360;

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(135deg, hsl(${hue} 75% 52%), hsl(${(hue + 40) % 360} 70% 36%))`,
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold tracking-wide text-white shadow-inner"
    >
      {initials}
    </span>
  );
}