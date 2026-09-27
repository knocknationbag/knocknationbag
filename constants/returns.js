/**
 * Return & refund vocabulary, mirrored by check constraints and the
 * transition map in update_return_status() (returns_and_refunds migration).
 * Client-safe so forms, badges and the dashboard share one definition.
 */

/** Days from delivery within which a return can be requested. */
export const RETURN_WINDOW_DAYS = 7

export const RETURN_REASONS = {
  defective: 'Defective product',
  not_satisfied: 'Not satisfied with the product',
}

/** What the customer must confirm — the client's conditions, verbatim in spirit. */
export const RETURN_CONDITIONS = [
  'The product is unused and unaltered, in the same condition as I received it.',
  'It will be returned in its original packaging, with its tags and the invoice.',
  'I will not ship the product until the Knock Nation team confirms the return.',
]

export const RETURN_STATUSES = [
  'Requested', 'Under Review', 'Approved', 'Rejected', 'Awaiting Return', 'Return Received',
  'Inspection Passed', 'Inspection Failed', 'Refund Pending', 'Refunded', 'Closed',
]

/**
 * Moves an admin may make by hand. Refund Pending and Refunded are reached
 * only through "Start refund" and the refund's confirmation.
 */
export const RETURN_TRANSITIONS = {
  Requested: ['Under Review', 'Approved', 'Rejected'],
  'Under Review': ['Approved', 'Rejected'],
  Approved: ['Awaiting Return', 'Return Received'],
  'Awaiting Return': ['Return Received'],
  'Return Received': ['Inspection Passed', 'Inspection Failed'],
  'Inspection Failed': ['Closed'],
  Rejected: ['Closed'],
  Refunded: ['Closed'],
}

/** What each status means, in words a customer understands. */
export const RETURN_STATUS_HELP = {
  Requested: 'We have received your return request. Please do not ship the product yet.',
  'Under Review': 'Our team is reviewing your request. Please do not ship the product yet.',
  Approved: 'Your return is approved. Our courier partner will collect it from your address — no return shipping charge.',
  Rejected: 'Your return request was not accepted.',
  'Awaiting Return': 'Pickup is being arranged by our courier partner.',
  'Return Received': 'The product has reached our warehouse and will be inspected.',
  'Inspection Passed': 'The product passed inspection. Your refund will be started.',
  'Inspection Failed': 'The product did not meet the return conditions, so no refund can be made.',
  'Refund Pending': 'Your refund has been started. Online payments are refunded to the original payment method within 10–15 working days of the product reaching our warehouse.',
  Refunded: 'Your refund has been processed.',
  Closed: 'This return is closed.',
}

export const REFUND_STATUS_LABELS = { pending: 'Pending', processed: 'Processed', failed: 'Failed' }
export const REFUND_METHOD_LABELS = { razorpay: 'Original online payment (Razorpay)', manual: 'Manual refund (COD)' }

/** Badge tones for the storefront Badge component. */
export const RETURN_STATUS_TONE = {
  Requested: 'neutral',
  'Under Review': 'neutral',
  Approved: 'new',
  Rejected: 'neutral',
  'Awaiting Return': 'new',
  'Return Received': 'new',
  'Inspection Passed': 'new',
  'Inspection Failed': 'neutral',
  'Refund Pending': 'new',
  Refunded: 'verified',
  Closed: 'neutral',
}

/**
 * Why a request was refused, by create_return_request()'s error code.
 * The database decides; this only words it.
 */
export const RETURN_ERRORS = {
  ORDER_NOT_FOUND: 'We could not find this order.',
  NOT_DELIVERED: 'A return can be requested once the order has been delivered.',
  WINDOW_CLOSED: `Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery. This order is past that window.`,
  NOT_DOMESTIC: 'Returns are available for domestic (India) orders only.',
  NOT_PAID: 'This order has no completed payment, so it cannot be returned.',
  ALREADY_REFUNDED: 'This order has already been refunded.',
  INVALID_REASON: 'Choose a reason for the return.',
  CONDITIONS_NOT_CONFIRMED: 'Please confirm the return conditions.',
  NO_ITEMS: 'Choose at least one item to return.',
  INVALID_ITEM: 'One of the items is not part of this order.',
  ALREADY_REQUESTED: 'A return has already been requested for this item.',
}
