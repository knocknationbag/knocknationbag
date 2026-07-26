'use client'

import { useId, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

/**
 * WAI-ARIA tab pattern with roving focus: Left/Right move between tabs,
 * Home/End jump to the ends. Used by the PDP detail panels and the account page.
 * `tabs` = [{ id, label, content }].
 */
export default function Tabs({ tabs = [], className }) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const refs = useRef([])

  function onKeyDown(event) {
    const last = tabs.length - 1
    let next = null
    if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1
    if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = last
    if (next === null) return
    event.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label="Product information" onKeyDown={onKeyDown} className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab, i) => {
          const selected = i === active
          return (
            <button
              key={tab.id}
              ref={(el) => { refs.current[i] = el }}
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                '-mb-px border-b-2 px-4 py-3 text-[15px] font-semibold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
                selected ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
