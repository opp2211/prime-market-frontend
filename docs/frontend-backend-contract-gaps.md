# Frontend Backend Contract Gaps

## Confirmed from code

- `/users/me` уже выглядит неоднородным по shape:
  - [Profile](../src/pages/account/Profile.jsx) нормализует `username/login`, `status/state`, `createdAt/created_at/registeredAt/registered_at/created`;
  - [user store](../src/app/user.js) параллельно ожидает на том же ответе `permissions[]` и `roles[]`.
  - Риск: один endpoint фактически обслуживает два разных client-shape.

- Ошибки backend уже воспринимаются как нестабильные:
  - [getErrorMessage](../src/shared/lib/errors.js) читает `detail`, `title`, `message`, `error`, `errors[]`.
  - Риск: фронт заранее страхуется от нескольких несовместимых форматов ошибки.

- Auth contract завязан на конкретные поля:
  - [auth store](../src/app/auth.js) ожидает `accessToken` и optional `tokenType`;
  - [Login](../src/pages/Login.jsx) ожидает `code` или `errorCode === EMAIL_NOT_VERIFIED`.
  - Риск: смена нейминга сломает bootstrap/login UX.

- Deposit contract смешивает разные naming conventions:
  - create payload: `deposit_method_id`;
  - queries: `currency_code`;
  - detail response: `public_id`, `created_at`, `details_issued_at`, `user_marked_paid_at`, `reject_reason`.
  - Риск: фронт уже живет в mixed snake_case/camelCase модели.

- `payment_details` имеет нефиксированный формат:
  - [DepositRequest](../src/pages/account/DepositRequest.jsx) и [Backoffice DepositRequest](../src/pages/backoffice/DepositRequest.jsx) умеют отрисовать string, JSON string, object, array;
  - backoffice отправляет `payment_details` как plain text.
  - Риск: отсутствие строгого контракта по типу и структуре.

- Offer schema contract критичен для формы:
  - [OfferForm](../src/pages/myOffers/OfferForm.jsx) и [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) ожидают `contexts`, `attributes`, `tradeFields`, `deliveryMethods`, `defaultValue*`, `isVisible`, `isRequired`, `dataType`.
  - Риск: любой drift schema ломает форму или валидацию.

- Market contract не совпадает с `my-offers` contract:
  - `my-offers` использует поля вроде `priceAmount`, `priceCurrencyCode`, `gameId`, `categoryId`;
  - market ожидает вложенный `price.amount`, `price.currencyCode`, `price.rate`, `owner.username`, `attributes[].optionTitle`.
  - Риск: одна сущность `offer` представлена двумя разными response-моделями.

- Market filters жестко зашиты под backend slug:
  - [marketFilters](../src/pages/market/marketFilters.js) поддерживает только category `currency`;
  - отдельный фильтр строится только для attribute slug `currency-type`.
  - Риск: переименование slug или расширение category model потребует правки UI.

- PATCH оффера зависит от семантики omitted / `null` / `[]`:
  - [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) формирует diff-only payload;
  - текст в [offerCopy](../src/pages/myOffers/offerCopy.js) прямо говорит о сохранении различий между omitted, `null` и `[]`.
  - Риск: если backend не различает эти случаи, edit flow будет вести себя нестабильно.

- Frontend предполагает server-side enforcement статусов:
  - user UI и backoffice UI скрывают/показывают действия по локальным status checks;
  - отдельной защиты от недопустимого статуса кроме UI нет.
  - Риск: backend обязан валидировать transitions сам.

## Inferred from code

- `intent`, `side` и `action` на рынке могут быть тремя разными backend-полями для близких понятий `buy/sell`; это выглядит как потенциально хрупкий контракт.
- Wallet transactions, deposit requests и часть auth ответов тяготеют к snake_case, а offers и market schema к camelCase; вероятен drift между backend модулями.
- Backoffice queue фильтруется repeated query params `status=...&status=...`; если backend перейдет на другой способ передачи массивов, UI сломается.

## Open questions

- Какой canonical shape у `/users/me`: flat user object, `user`-envelope или гибрид?
- Должен ли backend возвращать schema и для не-`currency` market категорий, если UI начнет их поддерживать?
- Какие статусы deposit request и offer считаются официальными и исчерпывающими?
