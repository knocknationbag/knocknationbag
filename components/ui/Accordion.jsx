'use client'

import { useId, useState } from 'react'
import { Plus } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Disclosure list used by the FAQ page and the PDP detail panels.
 * Native button + aria-expanded + aria-controls; content stays in the DOM so it
 * remains findable by in-page search and by crawlers.
 */
export default function Accordion({ items = [], defaultOpen = 0, className }) {
  const [open, setOpen] = useState(defaultOpen)
  const baseId = useId()

  return (
    <div className={cn('divide-y divide-border rounded-card border border-border bg-surface', className)}>
      {items.map((item, index) => {
        const isOpen = open === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div key={item.q ?? index}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold xl:px-6"
              >
                <span className="text-[16px] font-bold text-ink xl:text-[17px]">{item.q}</span>
                <Plus
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 text-gold transition-transform duration-200 ease-out',
                    isOpen && 'rotate-45',
                  )}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-6 xl:px-6"
            >
              <p className="max-w-[70ch] text-[15px] leading-[26px] text-body">{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
