import { ReactNode } from 'react'
import { Squares } from "./squares-background"
import { Particles } from "./Particles"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="dark h-screen overflow-hidden bg-[#04100a] relative">
      <div className="absolute inset-0 z-10 opacity-60">
        <Squares
          direction="diagonal"
          speed={0.4}
          squareSize={44}
          borderColor="#0f3d2e"
          hoverFillColor="#10b98133"
        />
      </div>
      <Particles />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  )
}
