import { ReactNode } from 'react'
import { Particles } from "./Particles"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#050f07]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[20%] top-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute right-[10%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-emerald-400/4 blur-[100px]" />
        <Particles count={18} />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}