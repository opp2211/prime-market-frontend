import { formatOrderDateTime, formatOrderNumber } from './orderPresentation'

const ORDER_DISPUTE_COPY = {
  ru: {
    supportFallback: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
    unassigned: '\u041d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d',
    you: '\u0412\u044b',
    assignmentState: {
      unassigned: {
        title: '\u041d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d',
        text: '\u0414\u0438\u0441\u043f\u0443\u0442 \u0435\u0449\u0451 \u043d\u0438 \u0437\u0430 \u043a\u0435\u043c \u043d\u0435 \u0437\u0430\u043a\u0440\u0435\u043f\u043b\u0451\u043d.',
      },
      mine: {
        title: '\u0412\u044b \u0432\u0435\u0434\u0451\u0442\u0435 \u044d\u0442\u043e\u0442 \u0434\u0438\u0441\u043f\u0443\u0442',
        text: '\u0412\u044b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u043b\u0438\u0441\u044c \u043a \u0440\u0430\u0437\u0431\u043e\u0440\u0443 \u0438 \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0440\u0438\u043d\u044f\u0442\u044c \u0440\u0435\u0448\u0435\u043d\u0438\u0435.',
      },
      assigned: {
        title: (name) => `\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u043d\u0430 ${name}`,
        text: '\u0414\u0438\u0441\u043f\u0443\u0442 \u0443\u0436\u0435 \u0432 \u0440\u0430\u0431\u043e\u0442\u0435 \u0443 \u0434\u0440\u0443\u0433\u043e\u0433\u043e \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430.',
      },
    },
    helper: {
      open: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0430.',
      inReview: '\u0414\u0438\u0441\u043f\u0443\u0442 \u043d\u0430 \u0440\u0430\u0441\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u0438\u0438.',
      resolved: '\u041f\u043e \u0434\u0438\u0441\u043f\u0443\u0442\u0443 \u043f\u0440\u0438\u043d\u044f\u0442\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u0435.',
      assigned: (name) => `\u0414\u0438\u0441\u043f\u0443\u0442 \u0432\u0435\u0434\u0451\u0442 ${name}.`,
    },
    meta: {
      status: '\u0421\u0442\u0430\u0442\u0443\u0441',
      reason: '\u041f\u0440\u0438\u0447\u0438\u043d\u0430',
      openedBy: '\u041e\u0442\u043a\u0440\u044b\u043b',
      createdAt: '\u0421\u043e\u0437\u0434\u0430\u043d',
      assignedTo: '\u0412 \u0440\u0430\u0431\u043e\u0442\u0435 \u0443',
      resolution: '\u0420\u0435\u0448\u0435\u043d\u0438\u0435',
      amendedQuantity: '\u041d\u043e\u0432\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e',
      order: '\u0417\u0430\u043a\u0430\u0437',
      buyer: '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c',
      seller: '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446',
    },
    status: {
      open: '\u041e\u0442\u043a\u0440\u044b\u0442',
      in_review: '\u041d\u0430 \u0440\u0430\u0441\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u0438\u0438',
      resolved: '\u0420\u0435\u0448\u0451\u043d',
      unknown: '\u0411\u0435\u0437 \u0441\u0442\u0430\u0442\u0443\u0441\u0430',
    },
    resolution: {
      cancel: '\u0417\u0430\u043a\u0430\u0437 \u043e\u0442\u043c\u0435\u043d\u0451\u043d',
      complete: '\u0417\u0430\u043a\u0430\u0437 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d',
      amend_quantity_and_complete:
        '\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u043e, \u0437\u0430\u043a\u0430\u0437 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d',
      unknown: '\u0420\u0435\u0448\u0435\u043d\u0438\u0435 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e',
    },
    reasons: {
      delivery_not_received: '\u0422\u043e\u0432\u0430\u0440 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d',
      partial_delivery: '\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430 \u0441 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u043c',
      wrong_item_or_context:
        '\u041d\u0435 \u0442\u043e\u0442 \u043b\u043e\u0442 \u0438\u043b\u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442',
      counterparty_unresponsive:
        '\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442 \u043d\u0435 \u043e\u0442\u0432\u0435\u0447\u0430\u0435\u0442',
      other: '\u0414\u0440\u0443\u0433\u043e\u0435',
    },
    reasonOptions: [
      {
        value: 'delivery_not_received',
        label: '\u0422\u043e\u0432\u0430\u0440 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d',
      },
      {
        value: 'partial_delivery',
        label: '\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430 \u0441 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u043c',
      },
      {
        value: 'wrong_item_or_context',
        label: '\u041d\u0435 \u0442\u043e\u0442 \u043b\u043e\u0442 \u0438\u043b\u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442',
      },
      {
        value: 'counterparty_unresponsive',
        label: '\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442 \u043d\u0435 \u0432\u044b\u0445\u043e\u0434\u0438\u0442 \u043d\u0430 \u0441\u0432\u044f\u0437\u044c',
      },
      {
        value: 'other',
        label: '\u0414\u0440\u0443\u0433\u043e\u0435',
      },
    ],
  },
  en: {
    supportFallback: 'Support',
    unassigned: 'Unassigned',
    you: 'You',
    assignmentState: {
      unassigned: {
        title: 'Unassigned',
        text: 'No support operator has taken this dispute yet.',
      },
      mine: {
        title: 'You are handling this dispute',
        text: 'You took ownership and can resolve this order dispute.',
      },
      assigned: {
        title: (name) => `Assigned to ${name}`,
        text: 'Another support operator is already handling this dispute.',
      },
    },
    helper: {
      open: 'Support has been notified.',
      inReview: 'The dispute is under review.',
      resolved: 'A support decision has already been recorded.',
      assigned: (name) => `${name} is handling this dispute.`,
    },
    meta: {
      status: 'Status',
      reason: 'Reason',
      openedBy: 'Opened by',
      createdAt: 'Created',
      assignedTo: 'Assigned support',
      resolution: 'Resolution',
      amendedQuantity: 'Adjusted quantity',
      order: 'Order',
      buyer: 'Buyer',
      seller: 'Seller',
    },
    status: {
      open: 'Open',
      in_review: 'In review',
      resolved: 'Resolved',
      unknown: 'Unknown',
    },
    resolution: {
      cancel: 'Order canceled',
      complete: 'Order confirmed',
      amend_quantity_and_complete: 'Quantity adjusted and order confirmed',
      unknown: 'Decision recorded',
    },
    reasons: {
      delivery_not_received: 'Item not delivered',
      partial_delivery: 'Quantity issue',
      wrong_item_or_context: 'Wrong item or context',
      counterparty_unresponsive: 'Counterparty is unresponsive',
      other: 'Other',
    },
    reasonOptions: [
      { value: 'delivery_not_received', label: 'Item not delivered' },
      { value: 'partial_delivery', label: 'Quantity issue' },
      { value: 'wrong_item_or_context', label: 'Wrong item or context' },
      { value: 'counterparty_unresponsive', label: 'Counterparty is unresponsive' },
      { value: 'other', label: 'Other' },
    ],
  },
}

function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

function getValue(source, keys) {
  if (!source || typeof source !== 'object') return undefined

  for (const key of keys) {
    if (source[key] != null) return source[key]
  }

  return undefined
}

function normalizeStatus(status) {
  const normalized = normalizeValue(status)

  if (normalized === 'opened' || normalized === 'pending') return 'open'
  if (normalized === 'inreview' || normalized === 'review') return 'in_review'
  if (normalized === 'closed') return 'resolved'

  return normalized || 'unknown'
}

function normalizeResolutionCode(code) {
  const normalized = normalizeValue(code)

  if (
    normalized === 'resolve_cancel' ||
    normalized === 'resolved_cancel' ||
    normalized === 'order_force_canceled_by_support'
  ) {
    return 'cancel'
  }

  if (
    normalized === 'resolve_complete' ||
    normalized === 'resolved_complete' ||
    normalized === 'order_force_completed_by_support'
  ) {
    return 'complete'
  }

  if (
    normalized === 'resolve_amend_quantity_and_complete' ||
    normalized === 'resolved_amend_quantity_and_complete' ||
    normalized === 'order_force_amended_quantity_by_support'
  ) {
    return 'amend_quantity_and_complete'
  }

  return normalized || 'unknown'
}

function humanizeCode(code) {
  const normalized = normalizeValue(code)
  if (!normalized) return ''

  return normalized
    .split('_')
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

function getUserSource(user) {
  if (!user || typeof user !== 'object') return null
  return user.user && typeof user.user === 'object' ? user.user : user
}

function getUserId(user) {
  const source = getUserSource(user)
  return source?.userId ?? source?.user_id ?? source?.id ?? source?.publicCode ?? source?.public_code
}

function getUserName(user) {
  const source = getUserSource(user)
  return (
    source?.displayName ||
    source?.display_name ||
    source?.username ||
    source?.login ||
    source?.name ||
    ''
  )
}

export function getOrderDisputeCopy(language = 'ru') {
  return ORDER_DISPUTE_COPY[language] || ORDER_DISPUTE_COPY.ru
}

export function getOrderDisputeReasonOptions(language = 'ru') {
  return getOrderDisputeCopy(language).reasonOptions
}

export function resolveOrderDisputeId(dispute) {
  return getValue(dispute, ['publicCode', 'public_code', 'id']) || ''
}

export function resolveOrderDisputeOrderId(dispute) {
  return (
    getValue(dispute?.order, ['publicCode', 'public_code', 'id']) ||
    getValue(dispute, ['orderCode', 'order_code', 'orderId', 'order_id']) ||
    ''
  )
}

export function resolveOrderDisputeStatus(dispute) {
  return normalizeStatus(
    getValue(dispute, ['status', 'disputeStatus', 'dispute_status'])
  )
}

export function resolveOrderDisputeStatusLabel(disputeOrStatus, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const status =
    typeof disputeOrStatus === 'string'
      ? normalizeStatus(disputeOrStatus)
      : resolveOrderDisputeStatus(disputeOrStatus)

  return copy.status[status] || copy.status.unknown
}

export function resolveOrderDisputeStatusTone(disputeOrStatus) {
  const status =
    typeof disputeOrStatus === 'string'
      ? normalizeStatus(disputeOrStatus)
      : resolveOrderDisputeStatus(disputeOrStatus)

  if (status === 'open') return 'warn'
  if (status === 'in_review') return 'info'
  if (status === 'resolved') return 'success'
  return 'muted'
}

export function resolveOrderDisputeReasonCode(dispute) {
  return normalizeValue(
    getValue(dispute, ['reasonCode', 'reason_code', 'reason', 'reasonKey', 'reason_key'])
  )
}

export function resolveOrderDisputeReasonLabel(dispute, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const explicitLabel =
    getValue(dispute, ['reasonLabel', 'reason_label', 'reasonTitle', 'reason_title']) ||
    getValue(dispute?.reason, ['title', 'label', 'name'])

  if (`${explicitLabel || ''}`.trim()) {
    return `${explicitLabel}`.trim()
  }

  const reasonCode = resolveOrderDisputeReasonCode(dispute)
  if (!reasonCode) return ''

  return copy.reasons[reasonCode] || humanizeCode(reasonCode) || copy.reasons.other
}

export function resolveOrderDisputeOpenedBy(dispute) {
  return (
    getValue(dispute, ['openedBy', 'opened_by', 'createdBy', 'created_by']) ||
    getValue(dispute?.participants, ['openedBy', 'opened_by']) ||
    null
  )
}

export function resolveOrderDisputeOpenedByLabel(dispute, language = 'ru') {
  const openedBy = resolveOrderDisputeOpenedBy(dispute)
  const name = getUserName(openedBy)
  if (name) return name

  const role =
    getValue(openedBy, ['role']) ||
    getValue(dispute, ['openedByRole', 'opened_by_role', 'createdByRole', 'created_by_role'])
  const normalizedRole = normalizeValue(role)

  if (language === 'en') {
    if (normalizedRole === 'buyer') return 'Buyer'
    if (normalizedRole === 'seller') return 'Seller'
    if (normalizedRole === 'support') return 'Support'
  }

  if (normalizedRole === 'buyer') return '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c'
  if (normalizedRole === 'seller') return '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446'
  if (normalizedRole === 'support') return '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430'
  return language === 'en' ? 'Participant' : '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a'
}

export function resolveOrderDisputeCreatedAt(dispute, language = 'ru') {
  return formatOrderDateTime(
    getValue(dispute, ['createdAt', 'created_at', 'openedAt', 'opened_at']),
    language
  )
}

export function resolveOrderDisputeAssignedSupport(dispute) {
  return (
    getValue(dispute, ['assignedSupportUser', 'assigned_support_user', 'assignedTo', 'assigned_to']) ||
    getValue(dispute, ['supportUser', 'support_user']) ||
    null
  )
}

export function resolveOrderDisputeAssignedSupportLabel(dispute, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const assignedSupport = resolveOrderDisputeAssignedSupport(dispute)
  const label = getUserName(assignedSupport)

  return label || copy.unassigned
}

export function isOrderDisputeAssignedToUser(dispute, user) {
  const currentUserId = getUserId(user)
  const assignedSupport = resolveOrderDisputeAssignedSupport(dispute)
  const assignedUserId = getUserId(assignedSupport)

  if (currentUserId != null && assignedUserId != null) {
    return String(currentUserId) === String(assignedUserId)
  }

  const currentName = normalizeValue(getUserName(user))
  const assignedName = normalizeValue(getUserName(assignedSupport))
  return Boolean(currentName && assignedName && currentName === assignedName)
}

export function resolveOrderDisputeAssignmentState(dispute, user, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const assignedSupport = resolveOrderDisputeAssignedSupport(dispute)
  const assignedLabel = resolveOrderDisputeAssignedSupportLabel(dispute, language)

  if (!assignedSupport || assignedLabel === copy.unassigned) {
    return {
      kind: 'unassigned',
      title: copy.assignmentState.unassigned.title,
      text: copy.assignmentState.unassigned.text,
    }
  }

  if (isOrderDisputeAssignedToUser(dispute, user)) {
    return {
      kind: 'mine',
      title: copy.assignmentState.mine.title,
      text: copy.assignmentState.mine.text,
    }
  }

  return {
    kind: 'assigned',
    title: copy.assignmentState.assigned.title(assignedLabel),
    text: copy.assignmentState.assigned.text,
  }
}

export function resolveOrderDisputeHelperText(dispute, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const status = resolveOrderDisputeStatus(dispute)
  const assignedSupport = resolveOrderDisputeAssignedSupportLabel(dispute, language)

  if (status === 'resolved') return copy.helper.resolved
  if (status === 'in_review') {
    if (assignedSupport !== copy.unassigned) {
      return copy.helper.assigned(assignedSupport)
    }
    return copy.helper.inReview
  }

  if (assignedSupport !== copy.unassigned) {
    return copy.helper.assigned(assignedSupport)
  }

  return copy.helper.open
}

export function resolveOrderDisputeAvailableActions(source) {
  const actions = source?.availableActions || source?.dispute?.availableActions || {}

  return {
    canOpenDispute: Boolean(actions?.canOpenDispute),
    canTakeInWork: Boolean(actions?.canTakeInWork),
    canResolveCancel: Boolean(actions?.canResolveCancel),
    canResolveComplete: Boolean(actions?.canResolveComplete),
    canResolveAmendQuantityAndComplete: Boolean(actions?.canResolveAmendQuantityAndComplete),
  }
}

export function resolveOrderDisputeResolutionCode(dispute) {
  return normalizeResolutionCode(
    getValue(dispute, ['resolutionCode', 'resolution_code', 'resolution', 'decision'])
  )
}

export function resolveOrderDisputeResolutionLabel(dispute, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const code = resolveOrderDisputeResolutionCode(dispute)
  const explicitLabel =
    getValue(dispute, ['resolutionLabel', 'resolution_label']) ||
    getValue(dispute, ['decisionLabel', 'decision_label'])

  if (`${explicitLabel || ''}`.trim()) {
    return `${explicitLabel}`.trim()
  }

  if (code === 'unknown') return ''

  return copy.resolution[code] || copy.resolution.unknown
}

export function resolveOrderDisputeResolutionQuantity(dispute) {
  return getValue(dispute, [
    'resolvedQuantity',
    'resolved_quantity',
    'amendedQuantity',
    'amended_quantity',
    'newOrderedQuantity',
    'new_ordered_quantity',
  ])
}

export function resolveOrderDisputeResolutionQuantityLabel(dispute, language = 'ru') {
  const quantity = resolveOrderDisputeResolutionQuantity(dispute)
  const formatted = formatOrderNumber(quantity, language, 4)
  return formatted === '\u2014' ? '' : formatted
}

export function hasOrderDispute(dispute) {
  if (!dispute || typeof dispute !== 'object') return false

  return Boolean(
    resolveOrderDisputeId(dispute) ||
      resolveOrderDisputeStatus(dispute) !== 'unknown' ||
      resolveOrderDisputeReasonCode(dispute)
  )
}

export function resolveOrderDisputeParticipant(dispute, kind, language = 'ru') {
  const copy = getOrderDisputeCopy(language)
  const participant =
    kind === 'buyer'
      ? getValue(dispute, ['buyer', 'buyerUser', 'buyer_user']) ||
        getValue(dispute?.order, ['buyer', 'buyerUser', 'buyer_user'])
      : getValue(dispute, ['seller', 'sellerUser', 'seller_user']) ||
        getValue(dispute?.order, ['seller', 'sellerUser', 'seller_user'])

  const label = getUserName(participant)
  if (label) return label

  return kind === 'buyer' ? copy.meta.buyer : copy.meta.seller
}

export function resolveOrderDisputeQueueItems(data) {
  const groupedItems = [data?.open, data?.inReview, data?.resolved]

  if (groupedItems.some(Array.isArray)) {
    const seenIds = new Set()

    return groupedItems
      .flatMap((items) => (Array.isArray(items) ? items : []))
      .filter((item) => {
        const disputeId = resolveOrderDisputeId(item)
        if (!disputeId) return true
        if (seenIds.has(disputeId)) return false
        seenIds.add(disputeId)
        return true
      })
  }

  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data)) return data
  return []
}

export function sortOrderDisputes(items) {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftTime = new Date(
      getValue(left, ['createdAt', 'created_at', 'openedAt', 'opened_at'])
    ).getTime()
    const rightTime = new Date(
      getValue(right, ['createdAt', 'created_at', 'openedAt', 'opened_at'])
    ).getTime()

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return rightTime - leftTime
    }

    const leftId = `${resolveOrderDisputeId(left)}`
    const rightId = `${resolveOrderDisputeId(right)}`
    return rightId.localeCompare(leftId)
  })
}

export function filterOrderDisputesByStatus(items, status) {
  const normalizedStatus = normalizeStatus(status)
  if (!normalizedStatus || normalizedStatus === 'all') return [...(Array.isArray(items) ? items : [])]

  return (Array.isArray(items) ? items : []).filter(
    (item) => resolveOrderDisputeStatus(item) === normalizedStatus
  )
}
