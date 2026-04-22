import { normalizeCurrencyCode } from '../../shared/lib/money'

function normalizeValue(value) {
  return value == null ? '' : String(value)
}

export function getMethodFieldDefinitions(method, copy) {
  const methodCode = normalizeCurrencyCode(method?.code)
  const fieldsCopy = copy.methodFields
  const networks = Array.isArray(method?.networks) ? method.networks.filter(Boolean) : []

  if (methodCode === 'SBP') {
    return [
      {
        name: 'phone_number',
        label: fieldsCopy.phoneLabel,
        placeholder: fieldsCopy.phonePlaceholder,
        type: 'tel',
        autoComplete: 'tel',
        required: true,
      },
      {
        name: 'bank_name',
        label: fieldsCopy.bankLabel,
        placeholder: fieldsCopy.bankPlaceholder,
        type: 'text',
        autoComplete: 'organization',
        required: true,
      },
      {
        name: 'recipient_name',
        label: fieldsCopy.recipientLabel,
        placeholder: fieldsCopy.recipientPlaceholder,
        type: 'text',
        autoComplete: 'name',
        required: true,
      },
    ]
  }

  if (methodCode === 'ONCHAIN_USDT') {
    return [
      {
        name: 'address',
        label: fieldsCopy.addressLabel,
        placeholder: fieldsCopy.addressPlaceholder,
        type: 'text',
        autoComplete: 'off',
        required: true,
      },
      {
        name: 'network',
        label: fieldsCopy.networkLabel,
        placeholder:
          networks.length > 0
            ? fieldsCopy.networkPlaceholder
            : fieldsCopy.networkCustomPlaceholder,
        type: networks.length > 0 ? 'select' : 'text',
        options: networks,
        autoComplete: 'off',
        required: true,
      },
    ]
  }

  if (methodCode === 'BINANCE_UID' || methodCode === 'BYBIT_UID') {
    return [
      {
        name: 'uid',
        label: fieldsCopy.uidLabel,
        placeholder: fieldsCopy.uidPlaceholder,
        type: 'text',
        autoComplete: 'off',
        required: true,
      },
    ]
  }

  return [
    {
      name: 'value',
      label: fieldsCopy.genericLabel,
      placeholder: fieldsCopy.genericPlaceholder,
      type: 'text',
      autoComplete: 'off',
      required: true,
    },
  ]
}

export function getMethodFieldValues(method, requisites = {}, copy) {
  const fieldDefinitions = getMethodFieldDefinitions(method, copy)

  return fieldDefinitions.reduce((accumulator, field) => {
    accumulator[field.name] = normalizeValue(requisites?.[field.name])
    return accumulator
  }, {})
}

export function buildRequisitesPayload(method, values, copy) {
  const fieldDefinitions = getMethodFieldDefinitions(method, copy)

  return fieldDefinitions.reduce((accumulator, field) => {
    const rawValue = normalizeValue(values?.[field.name]).trim()
    if (rawValue) accumulator[field.name] = rawValue
    return accumulator
  }, {})
}

export function validateMethodFieldValues(method, values, copy) {
  const fieldsCopy = copy.methodFields
  const methodCode = normalizeCurrencyCode(method?.code)
  const errors = {}

  const fieldDefinitions = getMethodFieldDefinitions(method, copy)

  fieldDefinitions.forEach((field) => {
    const value = normalizeValue(values?.[field.name]).trim()
    if (!field.required || value) return

    switch (field.name) {
      case 'phone_number':
        errors[field.name] = fieldsCopy.phoneError
        break
      case 'bank_name':
        errors[field.name] = fieldsCopy.bankError
        break
      case 'recipient_name':
        errors[field.name] = fieldsCopy.recipientError
        break
      case 'address':
        errors[field.name] = fieldsCopy.addressError
        break
      case 'network':
        errors[field.name] = fieldsCopy.networkError
        break
      case 'uid':
        errors[field.name] = fieldsCopy.uidError
        break
      default:
        errors[field.name] = fieldsCopy.genericError
        break
    }
  })

  if (methodCode === 'SBP' && !errors.phone_number) {
    const phone = normalizeValue(values?.phone_number).replace(/[^\d+]/g, '')
    if (phone.length < 10) {
      errors.phone_number = fieldsCopy.phoneError
    }
  }

  return errors
}
