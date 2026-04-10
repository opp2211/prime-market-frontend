# Forms And Validations

## Confirmed from code

Во frontend нет form-library и schema-library; валидация реализована вручную в компонентах и helper-файлах.

| Form | Files | Fields | Client validation | Gap / backend expectation |
| --- | --- | --- | --- | --- |
| Login | [Login](../src/pages/Login.jsx) | `email`, `password` | email required + regex; password required | нет правил сложности/длины пароля; ожидается backend code `EMAIL_NOT_VERIFIED` |
| Register | [Register](../src/pages/Register.jsx) | `username`, `email`, `password`, `passwordConfirm` | username required, length `3..24`; email required + regex; password required; confirm required + equality | нет правил на допустимые символы username и силу пароля |
| Check email resend | [CheckEmail](../src/pages/CheckEmail.jsx) | скрытое `email` из query/state | только наличие email перед resend | email берется из state/query и может отсутствовать |
| Login resend verification | [Login](../src/pages/Login.jsx) | `email` из login form | только наличие email перед resend | формат email повторно не валидируется в `onResend` |
| Deposit create | [DepositBalance](../src/pages/account/DepositBalance.jsx) | `currency`, `deposit_method_id`, `amount` | выбран method; amount > 0; форма сабмитится только при валидном числе | минимумы/максимумы, precision и валютные ограничения целиком на backend |
| Backoffice issue details | [Backoffice DepositRequest](../src/pages/backoffice/DepositRequest.jsx) | `payment_details` | required non-empty | нет клиентской проверки формата JSON/структуры реквизитов |
| Backoffice reject | [Backoffice DepositRequest](../src/pages/backoffice/DepositRequest.jsx) | `reject_reason` | required non-empty | нет минимальной длины или шаблона |
| Offer create/edit | [OfferForm](../src/pages/myOffers/OfferForm.jsx), [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) | fixed fields + schema-driven `contexts`, `attributes`, `tradeFields`, `deliveryMethods` | fixed: game, category, side, price currency, price amount; dynamic: required flags из server schema; numeric fields > 0; `min/max/quantity` consistency; delivery methods required по schema | server schema полностью определяет состав и обязательность части формы; нет client-side length limits для `title`, `description`, `tradeTerms` |

### Offer form: подтвержденные fixed fields

- Базовые поля:
  - `gameId`, `categoryId`, `side`, `title`, `description`
- Торговые поля:
  - `priceAmount`, `priceCurrencyCode`
  - при наличии в schema: `quantity`, `minTradeQuantity`, `maxTradeQuantity`, `quantityStep`, `tradeTerms`, `deliveryMethods`
- Dynamic fields из schema:
  - `contexts[]`
  - `attributes[]` с `dataType` = `select | multiselect | number | boolean | text`

### Offer form: подтвержденные правила валидации

- Цена обязательна и должна быть числом `> 0`.
- Currency code обязателен, но проверяется только на непустое значение.
- Все numeric trade fields валидируются как числа `> 0`, если поле visible и заполнено.
- Required `context` и `attribute` берутся из server schema.
- Для `multiselect` требуется хотя бы один выбранный вариант.
- Для `boolean` required-поля нужен именно boolean, а не `null`.
- Дополнительные cross-field правила:
  - `minTradeQuantity <= maxTradeQuantity`
  - `minTradeQuantity <= quantity`
  - `maxTradeQuantity <= quantity`
- В edit flow запрещен submit без изменений.

## Inferred from code

- Backend, вероятно, должен валидировать почти все business constraints сам:
  - реальные лимиты депозита;
  - допустимые currency codes;
  - допустимость статуса оффера;
  - допустимые combinations для schema-driven полей.
- `payment_details` выглядит как поле со слабо зафиксированным контрактом: user screen умеет читать и строку, и JSON, и объект, и массив.

## Open questions

- Должны ли `title` и `description` оффера быть опциональными по доменной модели, или это только UI-решение?
- Нужно ли валидировать password strength, allowed symbols в username и форматы payment details на клиенте?
- Должен ли deposit flow показывать server-side лимиты и комиссию до submit?
