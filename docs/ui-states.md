# UI States

## Confirmed from code

### Общие состояния

- `loading`:
  - auth/bootstrap screens в [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx) и [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx);
  - page-level loading во всех data screens;
  - skeleton states в [OfferForm](../src/pages/myOffers/OfferForm.jsx), [OfferList](../src/pages/myOffers/OfferList.jsx), [MarketPage](../src/pages/market/MarketPage.jsx), [MarketOffersTable](../src/pages/market/MarketOffersTable.jsx), [MarketOfferModal](../src/pages/market/MarketOfferModal.jsx).
- `error`:
  - generic error banners/messages строятся через [getErrorMessage](../src/shared/lib/errors.js);
  - retry присутствует не везде, но есть в market и my-offers editor/list.
- `empty`:
  - пустой кошелек и пустая история транзакций в [Wallet](../src/pages/account/Wallet.jsx);
  - пустой список депозитных заявок в user и backoffice;
  - пустой список офферов в [OfferList](../src/pages/myOffers/OfferList.jsx);
  - пустой результат market browse в [MarketOffersTable](../src/pages/market/MarketOffersTable.jsx).
- `success / notice`:
  - email resent, verify success, notice после create/save/publish/pause оффера;
  - явного toast-layer нет, используются inline `notice`.
- `disabled`:
  - submit buttons блокируются на loading;
  - часть select/input блокируется пока не загружены dependencies;
  - primary CTA в [MarketOfferModal](../src/pages/market/MarketOfferModal.jsx) всегда disabled.
- `unsupported / blocked`:
  - market показывает `unsupported` для категорий вне `currency`;
  - `blocked` используется, если фильтры/schema не готовы.
- `refreshing`:
  - market list умеет отдельное состояние `refreshing` без полной очистки списка.

### Статусы сущностей

#### Deposit request

Источник: [deposit status helpers](../src/app/depositRequests.js), [user deposit detail](../src/pages/account/DepositRequest.jsx), [backoffice deposit detail](../src/pages/backoffice/DepositRequest.jsx).

| Status | UI label / tone | Где показывается | Зависимые действия |
| --- | --- | --- | --- |
| `PENDING_DETAILS` | info | user + backoffice | user: `Cancel`; backoffice: `Issue details`, `Reject` |
| `WAITING_PAYMENT` | info | user | user: `Paid`, `Cancel` |
| `PAYMENT_VERIFICATION` | warn | user + backoffice | user: `Cancel`; backoffice: `Confirm`, `Reject` |
| `CONFIRMED` | success | user + backoffice | действий нет |
| `REJECTED` | danger | user + backoffice | действий нет, может показываться `reject_reason` |
| `CANCELLED` | muted | user + backoffice | действий нет |
| unknown | fallback raw status | user + backoffice | действий нет по UI-логике |

#### Offer

Источник: [offerPresentation](../src/pages/myOffers/offerPresentation.js), [OfferList](../src/pages/myOffers/OfferList.jsx).

| Status | Tone | Где показывается | Действие из списка |
| --- | --- | --- | --- |
| `active` | success | summary + list | `Pause` |
| `paused` | warn | summary + list | `Publish` |
| `draft` | info | summary + list | `Publish` |
| `closed` | muted | summary + list | нет действия |
| unknown | muted | summary + list | нет действия |

#### Profile

- В [Profile](../src/pages/account/Profile.jsx) пользовательский status нормализуется до `Active` или `Inactive`, иначе отдается как есть.

## Inferred from code

- `draft` для офферов отображается, но create flow по коду всегда создает `active`; значит часть статусов может приходить только с backend.
- Для deposit requests server может вернуть дополнительные статусы, потому что UI готов показать raw value.

## Open questions

- Нужно ли подтверждение для destructive actions `Cancel`, `Reject`, publish/pause?
- Следует ли различать `loading first time` и `refreshing` шире, чем только в market?
- Почему `Withdraw` присутствует как CTA без собственного состояния или экрана?
- Нет ли терминологического конфликта между market `intent`, market `action` и offer `side`: все три используют пары `buy/sell`, но описывают разные вещи.
