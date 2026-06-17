import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { ModalShell } from './ModalShell'
import { RULES_SECTIONS } from './rules-data'

export function RulesModalNew({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openSection, setOpenSection] = useState<number | null>(1)

  return (
    <ModalShell open={open} onClose={onClose} title="Правила проекта MCFIRE.BOX" icon="ScrollText" maxWidth="max-w-2xl">
      <div className="space-y-3 p-4 sm:p-6">
        {RULES_SECTIONS.map(section => {
          const isOpen = openSection === section.id
          return (
            <div key={section.id} className="overflow-hidden rounded-xl border border-[#1a3a1a] bg-black/20">
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span className="font-display text-base font-bold" style={{ color: section.color }}>
                  {section.title}
                </span>
                <Icon name="ChevronDown" size={18}
                  className="shrink-0 text-neutral-400 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="space-y-4 border-t border-[#1a3a1a] px-4 py-4">
                      {section.rules.map(rule => (
                        <div key={rule.num} className="border-l-2 pl-3" style={{ borderColor: `${section.color}55` }}>
                          <div className="mb-1 font-semibold text-white">
                            {/* цифры — цветом раздела, текст — белый */}
                            <span style={{ color: section.color }}>Правило {rule.num}.</span>{' '}
                            {rule.title}
                          </div>
                          {rule.body.map((line, i) => (
                            <p key={i} className="mb-1 text-sm leading-relaxed text-white/90">{line}</p>
                          ))}
                          <p className="mt-1.5 text-sm">
                            <span className="text-neutral-400">Наказание: </span>
                            <span className="font-semibold text-red-400">{rule.punishment}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </ModalShell>
  )
}