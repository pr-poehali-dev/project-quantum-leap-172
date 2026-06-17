import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  images: string[]
  intervalSec: number
  fallback: string
}

const MASK = 'linear-gradient(to right, black 60%, transparent 100%)'

export function HeroSlideshow({ images, intervalSec, fallback }: Props) {
  const pics = images.length > 0 ? images : [fallback]
  const [idx, setIdx] = useState(0)

  // предзагрузка изображений
  useEffect(() => {
    pics.forEach(src => { const im = new Image(); im.src = src })
  }, [pics])

  useEffect(() => {
    if (pics.length <= 1) return
    const ms = Math.min(Math.max(intervalSec || 12, 10), 30) * 1000
    const t = setInterval(() => setIdx(i => (i + 1) % pics.length), ms)
    return () => clearInterval(t)
  }, [pics.length, intervalSec])

  return (
    <div className="relative h-72 w-full md:h-[420px]">
      <AnimatePresence mode="sync">
        <motion.img
          key={idx}
          src={pics[idx]}
          alt="Minecraft character"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ maskImage: MASK, WebkitMaskImage: MASK }}
        />
      </AnimatePresence>

      {/* точки-индикаторы */}
      {pics.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {pics.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
