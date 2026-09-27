'use client'

import { createContext, useContext, useMemo, useState } from 'react'

const VariantSelectionContext = createContext(null)

/**
 * The option (colour) chosen on the product page, shared by the purchase
 * panel that sets it and the gallery that shows that colour's photos. The
 * two sit in different columns of a server-rendered page, so the state lives
 * in this small provider around them rather than in either one.
 */
export function VariantSelectionProvider({ initialVariantId = null, children }) {
  const [variantId, setVariantId] = useState(initialVariantId)
  const value = useMemo(() => ({ variantId, setVariantId }), [variantId])
  return <VariantSelectionContext.Provider value={value}>{children}</VariantSelectionContext.Provider>
}

/** { variantId, setVariantId }, or null outside a provider. */
export function useVariantSelection() {
  return useContext(VariantSelectionContext)
}
