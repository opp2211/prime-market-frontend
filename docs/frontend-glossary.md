# Frontend Glossary

## Confirmed from code

| Term | Meaning in frontend | Sources / notes |
| --- | --- | --- |
| Account | Личный кабинет авторизованного пользователя | [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx) |
| Backoffice | Отдельный staff-раздел с модерацией депозитов | [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx) |
| Permission | Строковое право доступа из `/users/me`, например `BACKOFFICE_ACCESS`, `DEPOSIT_APPROVE` | [user store](../src/app/user.js) |
| Wallet | Баланс пользователя по валютам | [Wallet](../src/pages/account/Wallet.jsx) |
| Wallet transaction | Элемент истории операций кошелька | [wallets API](../src/api/wallets.js) |
| Deposit request | Заявка пользователя на пополнение баланса | [depositRequests API](../src/api/depositRequests.js) |
| Payment details | Реквизиты для оплаты депозитной заявки | [account DepositRequest](../src/pages/account/DepositRequest.jsx), [backoffice DepositRequest](../src/pages/backoffice/DepositRequest.jsx) |
| Pending details | Статус заявки, когда реквизиты еще не выданы | [deposit status helpers](../src/app/depositRequests.js) |
| Waiting payment | Статус, когда пользователь уже получил реквизиты и должен оплатить | [deposit status helpers](../src/app/depositRequests.js) |
| Payment verification | Статус, когда пользователь отметил оплату и ждет ручную проверку | [deposit status helpers](../src/app/depositRequests.js) |
| Offer | Пользовательское торговое предложение в `my-offers` | [offers API](../src/api/offers.js) |
| My offers | Раздел управления собственными офферами | [MyOffersPage](../src/pages/myOffers/MyOffersPage.jsx) |
| Game | Игра, к которой относится оффер или market browse | [offers API](../src/api/offers.js), [market API](../src/api/market.js) |
| Category | Категория внутри игры | [offers API](../src/api/offers.js), [market API](../src/api/market.js) |
| Offer schema | Backend-схема динамических полей оффера | [getOfferSchema](../src/api/offers.js) |
| Context | Динамический фильтр/измерение торгового контекста оффера | [offerFormUtils](../src/pages/myOffers/offerFormUtils.js), [marketFilters](../src/pages/market/marketFilters.js) |
| Attribute | Динамический товарный параметр оффера | [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) |
| Delivery method | Способ передачи товара/валюты | [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) |
| Trade terms | Текстовые условия сделки | [OfferForm](../src/pages/myOffers/OfferForm.jsx) |
| Offer status | Состояние публикации оффера: `active`, `paused`, `draft`, `closed` | [offerPresentation](../src/pages/myOffers/offerPresentation.js) |
| Public market | Публичная витрина офферов | [MarketPage](../src/pages/market/MarketPage.jsx) |
| Intent | Рыночный сценарий просмотра: пользователь хочет `buy` или `sell` | [marketFilters](../src/pages/market/marketFilters.js) |
| Viewer currency | Валюта отображения market prices | [marketFilters](../src/pages/market/marketFilters.js) |
| Currency type | Специальный attribute slug `currency-type`, который market использует как отдельный фильтр | [marketFilters](../src/pages/market/marketFilters.js) |
| Side | Направление самого оффера (`buy` / `sell`) в `my-offers` | [offerPresentation](../src/pages/myOffers/offerPresentation.js) |
| Action | CTA на market row/modal (`Buy` / `Sell`) | [marketPresentation](../src/pages/market/marketPresentation.js) |
| Public ID | Внешний идентификатор депозитной заявки для URL и UI | [DepositRequest](../src/pages/account/DepositRequest.jsx) |

## Inferred from code

- `Offer` ближе к сущности listing/publication, чем к заказу.
- `Trader` в market UI обозначает владельца публичного оффера.

## Open questions

- Нужно ли унифицировать термины `intent`, `side` и `action`, чтобы они не выглядели как три разных `buy/sell`-измерения?
- Нужно ли в UI использовать единый термин `listing` вместо `offer`, если backend/domain model так и называется?
