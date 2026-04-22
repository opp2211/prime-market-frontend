import { getOrderCopy } from './orderCopy'
import { resolveOrderDisputeReasonLabel } from './orderDisputePresentation'
import {
  formatOrderDateTime,
  formatOrderMoney,
  formatOrderNumber,
  resolveOrderRoleLabel,
  resolveOrderRoleTone,
} from './orderPresentation'

const ORDER_EVENT_MESSAGES = {
  ru: {
    actorNotes: {
      buyer: '\u0421\u0442\u043e\u0440\u043e\u043d\u0430 \u043f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044f',
      seller: '\u0421\u0442\u043e\u0440\u043e\u043d\u0430 \u043f\u0440\u043e\u0434\u0430\u0432\u0446\u0430',
      system: '\u0421\u0438\u0441\u0442\u0435\u043c\u043d\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435',
      unknown: '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a \u0441\u0434\u0435\u043b\u043a\u0438',
    },
    titles: {
      created: '\u0421\u0434\u0435\u043b\u043a\u0430 \u043e\u0442\u043a\u0440\u044b\u0442\u0430',
      readyBuyer:
        '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c',
      readySeller:
        '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c',
      readyGeneric:
        '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430 \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c',
      partialDelivery: '\u041e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u0430\u044f \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430',
      delivered: '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0443',
      received: '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435',
      completed: '\u0421\u0434\u0435\u043b\u043a\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
      canceled: '\u0421\u0434\u0435\u043b\u043a\u0430 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430',
      cancelRequested: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} запросил отмену`,
      cancelRequestApproved: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} подтвердил отмену`,
      cancelRequestRejected: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} отклонил отмену`,
      amendQuantityRequested: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} запросил изменение объёма`,
      amendQuantityApproved: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} подтвердил изменение объёма`,
      amendQuantityRejected: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} отклонил изменение объёма`,
      expired: '\u0421\u0434\u0435\u043b\u043a\u0430 \u0438\u0441\u0442\u0435\u043a\u043b\u0430',
      unknown: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0441\u0434\u0435\u043b\u043a\u0438',
    },
    subtitles: {
      created: ({ actorLabel, quantityLabel, totalLabel }) => {
        const parts = [actorLabel ? `${actorLabel} \u043e\u0442\u043a\u0440\u044b\u043b \u0441\u0434\u0435\u043b\u043a\u0443` : '\u0421\u0434\u0435\u043b\u043a\u0430 \u0431\u044b\u043b\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0430']
        if (quantityLabel) parts.push(`\u043e\u0431\u044a\u0451\u043c ${quantityLabel}`)
        if (totalLabel) parts.push(`\u0441\u0443\u043c\u043c\u0430 ${totalLabel}`)
        return parts.join(' | ')
      },
      ready: ({ actorLabel }) =>
        `${actorLabel || '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a'} \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0443.`,
      partialDelivery: ({ actorLabel, deliveredLabel, orderedLabel, remainingLabel }) => {
        const parts = [
          actorLabel
            ? `${actorLabel} \u043e\u0442\u043c\u0435\u0442\u0438\u043b \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u0443\u044e \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0443.`
            : '\u0427\u0430\u0441\u0442\u0438\u0447\u043d\u0430\u044f \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u0430.',
        ]
        if (deliveredLabel && orderedLabel) {
          parts.push(`\u041f\u0435\u0440\u0435\u0434\u0430\u043d\u043e ${deliveredLabel} \u0438\u0437 ${orderedLabel}`)
        }
        if (remainingLabel) {
          parts.push(`\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c ${remainingLabel}`)
        }
        return parts.join(' | ')
      },
      delivered: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u043f\u043e\u043b\u043d\u0443\u044e \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0443. \u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c \u0442\u0435\u043f\u0435\u0440\u044c \u043c\u043e\u0436\u0435\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435.`
          : '\u041f\u043e\u043b\u043d\u0430\u044f \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u0430.',
      received: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435. \u0420\u0430\u0441\u0447\u0451\u0442 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u0444\u0438\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0435\u0442\u0441\u044f.`
          : '\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e.',
      completed: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? '\u0421\u0438\u0441\u0442\u0435\u043c\u0430 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043b\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u0435 \u0441\u0434\u0435\u043b\u043a\u0438.'
          : `${actorLabel || '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a'} \u0437\u0430\u043a\u0440\u044b\u043b \u0444\u0438\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u044d\u0442\u0430\u043f \u0441\u0434\u0435\u043b\u043a\u0438.`,
      canceled: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? '\u0421\u0434\u0435\u043b\u043a\u0430 \u0431\u044b\u043b\u0430 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438.'
          : `${actorLabel || '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a'} \u0438\u043d\u0438\u0446\u0438\u0438\u0440\u043e\u0432\u0430\u043b \u043e\u0442\u043c\u0435\u043d\u0443 \u0441\u0434\u0435\u043b\u043a\u0438.`,
      cancelRequested: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} отправил запрос на отмену. Вторая сторона должна принять решение.`,
      cancelRequestApproved: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} подтвердил запрос на отмену. Сделка будет остановлена backend.`,
      cancelRequestRejected: ({ actorLabel }) =>
        `${actorLabel || 'Участник'} отклонил запрос на отмену. Сделка остаётся в текущем состоянии.`,
      amendQuantityRequested: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'Участник'} отправил запрос на изменение объёма.`,
        ]
        if (quantityLabel) parts.push(`Новый объём: ${quantityLabel}`)
        return parts.join(' | ')
      },
      amendQuantityApproved: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'Участник'} подтвердил изменение объёма.`,
        ]
        if (quantityLabel) parts.push(`Согласованный объём: ${quantityLabel}`)
        return parts.join(' | ')
      },
      amendQuantityRejected: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'Участник'} отклонил изменение объёма.`,
        ]
        if (quantityLabel) parts.push(`Запрошенный объём: ${quantityLabel}`)
        return parts.join(' | ')
      },
      expired: ({ actorRole }) =>
        actorRole === 'system'
          ? '\u0421\u0440\u043e\u043a \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u044f \u0438\u0441\u0442\u0451\u043a \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438.'
          : '\u0421\u0440\u043e\u043a \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u044f \u0438\u0441\u0442\u0451\u043a \u0434\u043e \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0430 \u043a \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u043c\u0443 \u044d\u0442\u0430\u043f\u0443.',
      generic: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? '\u0421\u0438\u0441\u0442\u0435\u043c\u0430 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043b\u0430 \u043d\u043e\u0432\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435.'
          : `${actorLabel || '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a'} \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u043b \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435.`,
    },
  },
  en: {
    actorNotes: {
      buyer: 'Buyer side',
      seller: 'Seller side',
      system: 'System event',
      unknown: 'Deal participant',
    },
    titles: {
      created: 'Order created',
      readyBuyer: 'Buyer confirmed ready',
      readySeller: 'Seller confirmed ready',
      readyGeneric: 'Readiness confirmed',
      partialDelivery: 'Partial delivery recorded',
      delivered: 'Seller marked the order delivered',
      received: 'Buyer confirmed receipt',
      completed: 'Order completed',
      canceled: 'Order canceled',
      cancelRequested: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} requested cancellation`,
      cancelRequestApproved: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} approved cancellation`,
      cancelRequestRejected: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} rejected cancellation`,
      amendQuantityRequested: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} requested a quantity change`,
      amendQuantityApproved: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} approved the quantity change`,
      amendQuantityRejected: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} rejected the quantity change`,
      expired: 'Order expired',
      unknown: 'Order update',
    },
    subtitles: {
      created: ({ actorLabel, quantityLabel, totalLabel }) => {
        const parts = [actorLabel ? `${actorLabel} opened the deal` : 'The order was created']
        if (quantityLabel) parts.push(`quantity ${quantityLabel}`)
        if (totalLabel) parts.push(`total ${totalLabel}`)
        return parts.join(' | ')
      },
      ready: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} confirmed readiness to proceed.`,
      partialDelivery: ({ actorLabel, deliveredLabel, orderedLabel, remainingLabel }) => {
        const parts = [
          actorLabel
            ? `${actorLabel} recorded a partial delivery.`
            : 'A partial delivery was recorded.',
        ]
        if (deliveredLabel && orderedLabel) {
          parts.push(`Delivered ${deliveredLabel} of ${orderedLabel}`)
        }
        if (remainingLabel) {
          parts.push(`Remaining ${remainingLabel}`)
        }
        return parts.join(' | ')
      },
      delivered: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} confirmed full delivery. The buyer can now confirm receipt.`
          : 'Full delivery was recorded for this order.',
      received: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} confirmed receipt. Settlement is being finalized.`
          : 'Receipt was confirmed for this order.',
      completed: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? 'The system recorded successful order completion.'
          : `${actorLabel || 'A participant'} completed the final step of this order.`,
      canceled: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? 'The order was canceled automatically.'
          : `${actorLabel || 'A participant'} initiated cancellation.`,
      cancelRequested: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} sent a cancellation request. The counterparty must decide.`,
      cancelRequestApproved: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} approved the cancellation request. The backend will stop the order.`,
      cancelRequestRejected: ({ actorLabel }) =>
        `${actorLabel || 'A participant'} rejected the cancellation request. The order stays in its current state.`,
      amendQuantityRequested: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'A participant'} sent a quantity-change request.`,
        ]
        if (quantityLabel) parts.push(`New quantity: ${quantityLabel}`)
        return parts.join(' | ')
      },
      amendQuantityApproved: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'A participant'} approved the quantity change.`,
        ]
        if (quantityLabel) parts.push(`Approved quantity: ${quantityLabel}`)
        return parts.join(' | ')
      },
      amendQuantityRejected: ({ actorLabel, quantityLabel }) => {
        const parts = [
          `${actorLabel || 'A participant'} rejected the quantity change.`,
        ]
        if (quantityLabel) parts.push(`Requested quantity: ${quantityLabel}`)
        return parts.join(' | ')
      },
      expired: ({ actorRole }) =>
        actorRole === 'system'
          ? 'The order expired automatically before the next step.'
          : 'The order expired before the next step.',
      generic: ({ actorRole, actorLabel }) =>
        actorRole === 'system'
          ? 'A new system event was recorded for this order.'
          : `${actorLabel || 'A participant'} recorded a new order event.`,
    },
  },
}

function getDisputeEventMessages(language = 'ru') {
  if (language === 'en') {
    return {
      titles: {
        disputeOpened: 'Dispute opened',
        disputeTakenInWork: 'Support took the dispute in work',
        disputeResolved: 'Support resolved the dispute',
        forceCanceled: 'Support canceled the order',
        forceCompleted: 'Support confirmed the order',
        forceAmended: 'Support adjusted the quantity and confirmed the order',
      },
      subtitles: {
        disputeOpened: ({ actorLabel, reasonLabel }) => {
          const parts = [
            actorLabel
              ? `${actorLabel} escalated the order to support.`
              : 'The order was escalated to support.',
          ]
          if (reasonLabel) parts.push(`Reason: ${reasonLabel}`)
          return parts.join(' | ')
        },
        disputeTakenInWork: ({ actorLabel }) =>
          actorLabel
            ? `${actorLabel} explicitly took ownership of the dispute.`
            : 'Support explicitly took ownership of the dispute.',
        disputeResolved: ({ actorLabel }) =>
          actorLabel
            ? `${actorLabel} recorded the final support decision.`
            : 'Support recorded the final dispute decision.',
        forceCanceled: ({ actorLabel }) =>
          actorLabel
            ? `${actorLabel} force-canceled the order during dispute review.`
            : 'The order was force-canceled during dispute review.',
        forceCompleted: ({ actorLabel }) =>
          actorLabel
            ? `${actorLabel} force-completed the order during dispute review.`
            : 'The order was force-completed during dispute review.',
        forceAmended: ({ actorLabel, quantityLabel }) => {
          const parts = [
            actorLabel
              ? `${actorLabel} changed the final quantity and completed the order.`
              : 'Support changed the final quantity and completed the order.',
          ]
          if (quantityLabel) parts.push(`Final quantity: ${quantityLabel}`)
          return parts.join(' | ')
        },
      },
      actorNotes: {
        support: 'Support operator',
      },
    }
  }

  return {
    titles: {
      disputeOpened: '\u0414\u0438\u0441\u043f\u0443\u0442 \u043e\u0442\u043a\u0440\u044b\u0442',
      disputeTakenInWork:
        '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0432\u0437\u044f\u043b\u0430 \u0434\u0438\u0441\u043f\u0443\u0442 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443',
      disputeResolved:
        '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043b\u0430 \u0440\u0430\u0437\u0431\u043e\u0440',
      forceCanceled:
        '\u0417\u0430\u043a\u0430\u0437 \u043e\u0442\u043c\u0435\u043d\u0451\u043d \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439',
      forceCompleted:
        '\u0417\u0430\u043a\u0430\u0437 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439',
      forceAmended:
        '\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u043e \u0438 \u0437\u0430\u043a\u0430\u0437 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d',
    },
    subtitles: {
      disputeOpened: ({ actorLabel, reasonLabel }) => {
        const parts = [
          actorLabel
            ? `${actorLabel} \u043f\u0435\u0440\u0435\u0434\u0430\u043b \u0437\u0430\u043a\u0430\u0437 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443.`
            : '\u0417\u0430\u043a\u0430\u0437 \u043f\u0435\u0440\u0435\u0434\u0430\u043d \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443.',
        ]
        if (reasonLabel) parts.push(`\u041f\u0440\u0438\u0447\u0438\u043d\u0430: ${reasonLabel}`)
        return parts.join(' | ')
      },
      disputeTakenInWork: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u044f\u0432\u043d\u043e \u0432\u0437\u044f\u043b \u0434\u0438\u0441\u043f\u0443\u0442 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443.`
          : '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0432\u0437\u044f\u043b\u0430 \u0434\u0438\u0441\u043f\u0443\u0442 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443.',
      disputeResolved: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043b \u0438\u0442\u043e\u0433\u043e\u0432\u043e\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043f\u043e \u0434\u0438\u0441\u043f\u0443\u0442\u0443.`
          : '\u041f\u043e \u0434\u0438\u0441\u043f\u0443\u0442\u0443 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u0438\u0442\u043e\u0433\u043e\u0432\u043e\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435.',
      forceCanceled: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u043f\u0440\u0438\u043d\u0443\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u043e\u0442\u043c\u0435\u043d\u0438\u043b \u0437\u0430\u043a\u0430\u0437 \u0432 \u0440\u0430\u043c\u043a\u0430\u0445 \u0440\u0430\u0437\u0431\u043e\u0440\u0430.`
          : '\u0417\u0430\u043a\u0430\u0437 \u0431\u044b\u043b \u043f\u0440\u0438\u043d\u0443\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u043e\u0442\u043c\u0435\u043d\u0451\u043d \u0432 \u0440\u0430\u043c\u043a\u0430\u0445 \u0440\u0430\u0437\u0431\u043e\u0440\u0430.',
      forceCompleted: ({ actorLabel }) =>
        actorLabel
          ? `${actorLabel} \u043f\u0440\u0438\u043d\u0443\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b \u0437\u0430\u043a\u0430\u0437 \u0432 \u0440\u0430\u043c\u043a\u0430\u0445 \u0440\u0430\u0437\u0431\u043e\u0440\u0430.`
          : '\u0417\u0430\u043a\u0430\u0437 \u0431\u044b\u043b \u043f\u0440\u0438\u043d\u0443\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043d \u0432 \u0440\u0430\u043c\u043a\u0430\u0445 \u0440\u0430\u0437\u0431\u043e\u0440\u0430.',
      forceAmended: ({ actorLabel, quantityLabel }) => {
        const parts = [
          actorLabel
            ? `${actorLabel} \u0438\u0437\u043c\u0435\u043d\u0438\u043b \u0438\u0442\u043e\u0433\u043e\u0432\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438 \u0437\u0430\u043a\u0440\u044b\u043b \u0437\u0430\u043a\u0430\u0437.`
            : '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0438\u0437\u043c\u0435\u043d\u0438\u043b\u0430 \u0438\u0442\u043e\u0433\u043e\u0432\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438 \u0437\u0430\u043a\u0440\u044b\u043b\u0430 \u0437\u0430\u043a\u0430\u0437.',
        ]
        if (quantityLabel) {
          parts.push(`\u0418\u0442\u043e\u0433\u043e\u0432\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e: ${quantityLabel}`)
        }
        return parts.join(' | ')
      },
    },
    actorNotes: {
      support: '\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438',
    },
  }
}

function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

function getEventMessages(language = 'ru') {
  return ORDER_EVENT_MESSAGES[language] || ORDER_EVENT_MESSAGES.ru
}

function buildEventSummary(payload, order, language = 'ru') {
  const quantity = formatOrderNumber(payload?.orderedQuantity, language, 4)
  const currencyCode =
    payload?.viewerCurrencyCode || order?.price?.currencyCode || order?.viewerCurrencyCode
  const total = formatOrderMoney(payload?.displayTotalAmount, currencyCode, language)

  return {
    quantityLabel: quantity === '\u2014' ? '' : quantity,
    totalLabel: total === '\u2014' || total.startsWith('\u2014 ') ? '' : total,
  }
}

function buildDeliverySummary(event, order, language = 'ru') {
  const payload = event?.payload || {}
  const eventType = normalizeValue(event?.eventType)
  const orderedSource = payload?.orderedQuantity ?? order?.orderedQuantity
  let deliveredSource =
    payload?.deliveredQuantity ??
    payload?.displayDeliveredQuantity ??
    payload?.newDeliveredQuantity ??
    payload?.currentDeliveredQuantity

  if (
    deliveredSource == null &&
    (eventType === 'seller_marked_delivered' ||
      eventType.endsWith('marked_delivered') ||
      eventType === 'buyer_confirmed_received' ||
      eventType.endsWith('confirmed_received') ||
      eventType === 'order_completed')
  ) {
    deliveredSource = orderedSource
  }

  const orderedValue = Number(orderedSource)
  const deliveredValue = Number(deliveredSource)
  const orderedLabel = formatOrderNumber(orderedSource, language, 4)
  const deliveredLabel = formatOrderNumber(deliveredSource, language, 4)
  const remainingLabel =
    Number.isFinite(orderedValue) && Number.isFinite(deliveredValue)
      ? formatOrderNumber(Math.max(orderedValue - deliveredValue, 0), language, 4)
      : '\u2014'

  return {
    orderedLabel: orderedLabel === '\u2014' ? '' : orderedLabel,
    deliveredLabel: deliveredLabel === '\u2014' ? '' : deliveredLabel,
    remainingLabel: remainingLabel === '\u2014' ? '' : remainingLabel,
  }
}

function buildRequestQuantitySummary(event, language = 'ru') {
  const payload = event?.payload || {}
  const quantity =
    payload?.requestedQuantity ??
    payload?.requested_quantity ??
    payload?.quantity ??
    payload?.newQuantity ??
    payload?.new_quantity ??
    payload?.newOrderedQuantity ??
    payload?.new_ordered_quantity ??
    payload?.approvedQuantity ??
    payload?.approved_quantity ??
    payload?.orderedQuantity
  const quantityLabel = formatOrderNumber(quantity, language, 4)

  return {
    quantityLabel: quantityLabel === '\u2014' ? '' : quantityLabel,
  }
}

function buildDisputeReasonSummary(event, language = 'ru') {
  const payload = event?.payload || {}
  return {
    reasonLabel: resolveOrderDisputeReasonLabel(payload, language),
  }
}

function resolveEventActorRole(event) {
  const actorRole = normalizeValue(event?.actor?.role)
  if (actorRole) return actorRole

  const normalized = normalizeValue(event?.eventType)
  const payload = event?.payload || {}

  if (normalized.endsWith('_approved')) {
    const approverRole = normalizeValue(
      payload?.decidedByRole ||
        payload?.decided_by_role ||
        payload?.approvedByRole ||
        payload?.approved_by_role ||
        payload?.actorRole ||
        payload?.actor_role
    )
    if (approverRole) return approverRole
  }

  if (normalized.endsWith('_rejected')) {
    const rejecterRole = normalizeValue(
      payload?.decidedByRole ||
        payload?.decided_by_role ||
        payload?.rejectedByRole ||
        payload?.rejected_by_role ||
        payload?.actorRole ||
        payload?.actor_role
    )
    if (rejecterRole) return rejecterRole
  }

  if (normalized.endsWith('_requested')) {
    const requesterRole = normalizeValue(
      payload?.requestedByRole ||
        payload?.requested_by_role ||
        payload?.actorRole ||
        payload?.actor_role
    )
    if (requesterRole) return requesterRole
  }

  if (
    normalized === 'dispute_taken_in_work' ||
    normalized === 'dispute_resolved' ||
    normalized.startsWith('order_force_')
  ) {
    return 'support'
  }

  if (normalized.startsWith('buyer_')) return 'buyer'
  if (normalized.startsWith('seller_')) return 'seller'
  if (normalized === 'order_expired' || normalized === 'order_completed') return 'system'

  return ''
}

function resolveEventTone(eventType) {
  const normalized = normalizeValue(eventType)

  if (normalized === 'dispute_resolved') return 'success'
  if (normalized === 'dispute_taken_in_work') return 'info'
  if (normalized === 'dispute_opened') return 'warn'
  if (normalized === 'order_force_canceled_by_support') return 'danger'
  if (
    normalized === 'order_force_completed_by_support' ||
    normalized === 'order_force_amended_quantity_by_support'
  ) {
    return 'success'
  }
  if (normalized.includes('rejected')) return 'danger'
  if (normalized.includes('approved')) return 'success'
  if (normalized.includes('requested')) return 'info'
  if (normalized.includes('cancel')) return 'danger'
  if (normalized.includes('expire')) return 'muted'
  if (normalized.includes('complete') || normalized.includes('received')) return 'success'
  if (normalized.includes('partial') && normalized.includes('deliver')) return 'info'
  if (normalized.includes('marked_delivered') || normalized === 'seller_marked_delivered') {
    return 'info'
  }
  if (normalized.includes('confirm') || normalized.includes('ready')) return 'success'
  if (normalized.includes('create') || normalized.includes('open')) return 'info'
  return 'muted'
}

function resolveEventTitle(eventType, actorRole, language = 'ru') {
  const messages = getEventMessages(language)
  const disputeMessages = getDisputeEventMessages(language)
  const normalized = normalizeValue(eventType)
  const actorLabel = resolveOrderRoleLabel(actorRole, language)

  if (normalized === 'dispute_opened') return disputeMessages.titles.disputeOpened
  if (normalized === 'dispute_taken_in_work') {
    return disputeMessages.titles.disputeTakenInWork
  }
  if (normalized === 'dispute_resolved') return disputeMessages.titles.disputeResolved
  if (normalized === 'order_force_canceled_by_support') {
    return disputeMessages.titles.forceCanceled
  }
  if (normalized === 'order_force_completed_by_support') {
    return disputeMessages.titles.forceCompleted
  }
  if (normalized === 'order_force_amended_quantity_by_support') {
    return disputeMessages.titles.forceAmended
  }

  if (normalized === 'order_created') return messages.titles.created

  if (normalized === 'maker_confirmed_ready' || normalized.endsWith('confirmed_ready')) {
    if (actorRole === 'buyer') return messages.titles.readyBuyer
    if (actorRole === 'seller') return messages.titles.readySeller
    return messages.titles.readyGeneric
  }

  if (normalized === 'cancel_requested') {
    return messages.titles.cancelRequested({ actorLabel })
  }

  if (normalized === 'cancel_request_approved') {
    return messages.titles.cancelRequestApproved({ actorLabel })
  }

  if (normalized === 'cancel_request_rejected') {
    return messages.titles.cancelRequestRejected({ actorLabel })
  }

  if (normalized === 'amend_quantity_requested') {
    return messages.titles.amendQuantityRequested({ actorLabel })
  }

  if (normalized === 'amend_quantity_approved') {
    return messages.titles.amendQuantityApproved({ actorLabel })
  }

  if (normalized === 'amend_quantity_rejected') {
    return messages.titles.amendQuantityRejected({ actorLabel })
  }

  if (
    normalized === 'seller_marked_partial_delivery' ||
    (normalized.includes('partial') && normalized.includes('deliver'))
  ) {
    return messages.titles.partialDelivery
  }

  if (normalized === 'seller_marked_delivered' || normalized.endsWith('marked_delivered')) {
    return messages.titles.delivered
  }

  if (normalized === 'buyer_confirmed_received' || normalized.endsWith('confirmed_received')) {
    return messages.titles.received
  }

  if (normalized === 'order_completed' || normalized.endsWith('_completed')) {
    return messages.titles.completed
  }

  if (normalized === 'order_canceled' || normalized === 'order_cancelled') {
    return messages.titles.canceled
  }

  if (normalized === 'order_expired') {
    return messages.titles.expired
  }

  return messages.titles.unknown
}

function resolveEventSubtitle(event, order, actorLabel, language = 'ru') {
  const messages = getEventMessages(language)
  const disputeMessages = getDisputeEventMessages(language)
  const actorRole = resolveEventActorRole(event)
  const normalized = normalizeValue(event?.eventType)

  if (normalized === 'dispute_opened') {
    return disputeMessages.subtitles.disputeOpened({
      actorLabel,
      ...buildDisputeReasonSummary(event, language),
    })
  }

  if (normalized === 'dispute_taken_in_work') {
    return disputeMessages.subtitles.disputeTakenInWork({ actorLabel })
  }

  if (normalized === 'dispute_resolved') {
    return disputeMessages.subtitles.disputeResolved({ actorLabel })
  }

  if (normalized === 'order_force_canceled_by_support') {
    return disputeMessages.subtitles.forceCanceled({ actorLabel })
  }

  if (normalized === 'order_force_completed_by_support') {
    return disputeMessages.subtitles.forceCompleted({ actorLabel })
  }

  if (normalized === 'order_force_amended_quantity_by_support') {
    return disputeMessages.subtitles.forceAmended({
      actorLabel,
      ...buildRequestQuantitySummary(event, language),
    })
  }

  if (normalized === 'order_created') {
    return messages.subtitles.created({
      actorLabel,
      ...buildEventSummary(event?.payload, order, language),
    })
  }

  if (normalized === 'maker_confirmed_ready' || normalized.endsWith('confirmed_ready')) {
    return messages.subtitles.ready({ actorLabel })
  }

  if (normalized === 'cancel_requested') {
    return messages.subtitles.cancelRequested({ actorLabel })
  }

  if (normalized === 'cancel_request_approved') {
    return messages.subtitles.cancelRequestApproved({ actorLabel })
  }

  if (normalized === 'cancel_request_rejected') {
    return messages.subtitles.cancelRequestRejected({ actorLabel })
  }

  if (normalized === 'amend_quantity_requested') {
    return messages.subtitles.amendQuantityRequested({
      actorLabel,
      ...buildRequestQuantitySummary(event, language),
    })
  }

  if (normalized === 'amend_quantity_approved') {
    return messages.subtitles.amendQuantityApproved({
      actorLabel,
      ...buildRequestQuantitySummary(event, language),
    })
  }

  if (normalized === 'amend_quantity_rejected') {
    return messages.subtitles.amendQuantityRejected({
      actorLabel,
      ...buildRequestQuantitySummary(event, language),
    })
  }

  if (
    normalized === 'seller_marked_partial_delivery' ||
    (normalized.includes('partial') && normalized.includes('deliver'))
  ) {
    return messages.subtitles.partialDelivery({
      actorLabel,
      ...buildDeliverySummary(event, order, language),
    })
  }

  if (normalized === 'seller_marked_delivered' || normalized.endsWith('marked_delivered')) {
    return messages.subtitles.delivered({ actorLabel })
  }

  if (normalized === 'buyer_confirmed_received' || normalized.endsWith('confirmed_received')) {
    return messages.subtitles.received({ actorLabel })
  }

  if (normalized === 'order_completed' || normalized.endsWith('_completed')) {
    return messages.subtitles.completed({ actorRole, actorLabel })
  }

  if (normalized === 'order_canceled' || normalized === 'order_cancelled') {
    return messages.subtitles.canceled({ actorRole, actorLabel })
  }

  if (normalized === 'order_expired') {
    return messages.subtitles.expired({ actorRole })
  }

  return messages.subtitles.generic({ actorRole, actorLabel })
}

function resolveActorNote(actorRole, language = 'ru') {
  const messages = getEventMessages(language)
  const disputeMessages = getDisputeEventMessages(language)
  if (actorRole === 'support') {
    return disputeMessages.actorNotes.support
  }
  return messages.actorNotes[actorRole] || messages.actorNotes.unknown
}

export function sortOrderEvents(items) {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftTime = new Date(left?.createdAt).getTime()
    const rightTime = new Date(right?.createdAt).getTime()

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return leftTime - rightTime
    }

    const leftId = Number(left?.id)
    const rightId = Number(right?.id)
    if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
      return leftId - rightId
    }

    return 0
  })
}

export function mapOrderEventToDisplay(event, context = {}) {
  const language = context?.language || 'ru'
  const order = context?.order || null
  const copy = getOrderCopy(language)
  const actorRole = resolveEventActorRole(event)
  const actorLabel = resolveOrderRoleLabel(actorRole, language)

  return {
    title: resolveEventTitle(event?.eventType, actorRole, language),
    subtitle: resolveEventSubtitle(event, order, actorLabel, language),
    timestamp: formatOrderDateTime(event?.createdAt, language),
    actorLabel,
    actorTone: resolveOrderRoleTone(actorRole),
    actorNote: resolveActorNote(actorRole, language),
    tone: resolveEventTone(event?.eventType),
    dateTime: event?.createdAt || '',
    fallbackTitle: copy.details.history.title,
  }
}
