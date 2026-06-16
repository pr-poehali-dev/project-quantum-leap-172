import { useMemo } from "react"

export function Particles({ count = 22 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 7,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.4,
        green: Math.random() > 0.5,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute bottom-[-20px] rounded-sm"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            background: d.green ? "#10b981" : "#6ee7b7",
            boxShadow: `0 0 ${d.size * 2}px ${d.green ? "#10b981" : "#6ee7b7"}`,
            animation: `floatUp ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
