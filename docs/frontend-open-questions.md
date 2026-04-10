# Frontend Open Questions

## Confirmed from code

- Вопрос: должен ли login возвращать пользователя на исходный protected route?
  - Почему это важно: [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx) и [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx) передают `from`, но [Login](../src/pages/Login.jsx) всегда ведет на `/`.
  - Затрагивает: auth flow, account, my-offers, backoffice.

- Вопрос: должен ли backoffice-пользователь быть принудительно уведен из обычного интерфейса?
  - Почему это важно: [App](../src/app/App.jsx) автоматически редиректит пользователя с `BACKOFFICE_ACCESS` в `/backoffice`.
  - Затрагивает: глобальная навигация, доступ к market, my-offers, account.

- Вопрос: являются ли `Edit profile` и `Change email` рабочими действиями или заглушками?
  - Почему это важно: кнопки видимы в [Profile](../src/pages/account/Profile.jsx), но не имеют handlers.
  - Затрагивает: профиль, UX доверие к CTA.

- Вопрос: что должно происходить по `Withdraw`?
  - Почему это важно: CTA есть в [Wallet](../src/pages/account/Wallet.jsx), но сценария и route нет.
  - Затрагивает: balance UI, money flows.

- Вопрос: нужен ли confirm step перед `Cancel`, `Reject`, `Confirm`, publish/pause?
  - Почему это важно: destructive и money-sensitive действия сейчас выполняются сразу.
  - Затрагивает: deposit requests, backoffice moderation, my-offers.

- Вопрос: должна ли публичная market-страница быть discoverable из навигации?
  - Почему это важно: route `/market` есть в [router](../src/app/router.jsx), но явной ссылки в основном UI не видно.
  - Затрагивает: public navigation, маркетинговый сценарий.

## Inferred from code

- Вопрос: нужен ли draft-flow для офферов?
  - Почему это важно: UI знает статус `draft`, но create flow публикует оффер сразу как `active`.
  - Затрагивает: offer lifecycle, moderation/publication model.

- Вопрос: поддерживается ли market только для `currency` временно или это отдельный продуктовый срез?
  - Почему это важно: [marketFilters](../src/pages/market/marketFilters.js) и [MarketToolbar](../src/pages/market/MarketToolbar.jsx) жестко завязаны на category slug `currency`.
  - Затрагивает: market, category model, roadmap.

- Вопрос: должны ли titles/descriptions офферов быть опциональными?
  - Почему это важно: UI позволяет оставить их пустыми и строит fallback title.
  - Затрагивает: качество листинга, SEO/поиск, backend validation.

- Вопрос: нужна ли клиентская валидация формата `payment_details`?
  - Почему это важно: пользовательский экран умеет читать строку, JSON, объект и массив, а backoffice вводит произвольный текст.
  - Затрагивает: deposit moderation, support load, contract stability.

## Open questions

- Каковы точные правила domain model для `roles` и `permissions`, и какие из них должны отражаться во frontend?
- Может ли пользователь прикладывать подтверждение оплаты или комментарий к deposit request, или достаточно кнопки `Paid`?
- Должны ли market modal и market row вести к созданию order, чату или отдельной карточке продавца на следующем этапе?
- Какие offer statuses backend реально возвращает помимо `active`, `paused`, `draft`, `closed`?
