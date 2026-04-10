# Screens And Routes

## Confirmed from code

### Public routes

| Route | Screen / layout | Access | Purpose | Main actions | Data / dependencies |
| --- | --- | --- | --- | --- | --- |
| `/` | [Home](../src/pages/Home.jsx) under [App](../src/app/App.jsx) | Public | Лендинг продукта | Перейти к регистрации или логину | [i18n](../src/app/i18n.jsx) |
| `/market` | [MarketPage](../src/pages/market/MarketPage.jsx) | Public | Публичный read-only список валютных офферов | Переключать `intent`, игру, категорию, viewer currency, сортировку, schema-фильтры, пагинацию, открывать modal | [market API](../src/api/market.js), [marketFilters](../src/pages/market/marketFilters.js) |
| `/login` | [Login](../src/pages/Login.jsx) | Public | Локальный логин и OAuth entry | Войти по email/password, стартовать Google/Discord OAuth, отправить письмо верификации | [auth API](../src/api/auth.js), [auth store](../src/app/auth.js) |
| `/register` | [Register](../src/pages/Register.jsx) | Public | Регистрация | Создать аккаунт | [auth API](../src/api/auth.js) |
| `/check-email` | [CheckEmail](../src/pages/CheckEmail.jsx) | Public | Экран после регистрации | Повторно отправить письмо, перейти к логину | [auth API](../src/api/auth.js) |
| `/verify-email` | [VerifyEmail](../src/pages/VerifyEmail.jsx) | Public | Подтверждение email по token | Верифицировать token, перейти на главную или логин | [auth API](../src/api/auth.js), [auth store](../src/app/auth.js) |

### Account area

Маршруты ниже защищаются не в router, а через [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx), который редиректит неавторизованного пользователя на `/login`.

| Route | Screen | Purpose | Main actions | API / store |
| --- | --- | --- | --- | --- |
| `/account` | [AccountLayout](../src/pages/account/AccountLayout.jsx) | Точка входа | Редирект на `/account/profile` | [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx) |
| `/account/profile` | [Profile](../src/pages/account/Profile.jsx) | Просмотр профиля | Только визуальные CTA `Edit profile`, `Change email` | [users API](../src/api/users.js) |
| `/account/wallet` | [Wallet](../src/pages/account/Wallet.jsx) | Просмотр кошельков и транзакций | Перейти к пополнению, переключать фильтры `currency` и `type` | [wallets API](../src/api/wallets.js) |
| `/account/deposit` | [DepositBalance](../src/pages/account/DepositBalance.jsx) | Создание заявки на пополнение | Выбрать валюту, метод, сумму, создать заявку | [deposit API](../src/api/deposit.js), [depositRequests API](../src/api/depositRequests.js) |
| `/account/deposit-requests` | [DepositRequests](../src/pages/account/DepositRequests.jsx) | Список своих заявок на пополнение | Открывать карточку заявки, перейти к созданию новой | [depositRequests API](../src/api/depositRequests.js), [deposit status helpers](../src/app/depositRequests.js) |
| `/account/deposit-requests/:publicId` | [DepositRequest](../src/pages/account/DepositRequest.jsx) | Детали заявки | Копировать ID/реквизиты, отметить как оплачено, отменить | [depositRequests API](../src/api/depositRequests.js), [clipboard](../src/shared/lib/clipboard.js) |

### My offers

Маршруты ниже тоже идут через [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx).

| Route | Screen | Purpose | Main actions | API / store |
| --- | --- | --- | --- | --- |
| `/my-offers` | [MyOffersPage](../src/pages/myOffers/MyOffersPage.jsx) | Список собственных офферов | Создать оффер, открыть редактирование, publish/pause | [offers API](../src/api/offers.js), [OfferList](../src/pages/myOffers/OfferList.jsx) |
| `/my-offers/new` | [OfferCreatePage](../src/pages/myOffers/OfferCreatePage.jsx) | Создание оффера | Заполнить schema-driven форму и опубликовать | [OfferForm](../src/pages/myOffers/OfferForm.jsx), [offerFormUtils](../src/pages/myOffers/offerFormUtils.js) |
| `/my-offers/:offerId/edit` | [OfferEditPage](../src/pages/myOffers/OfferEditPage.jsx) | Редактирование оффера | Изменить поля и сохранить PATCH | [OfferForm](../src/pages/myOffers/OfferForm.jsx), [offers API](../src/api/offers.js) |

### Backoffice

Маршруты ниже защищаются через [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx): нужен auth, загрузка user и permission `BACKOFFICE_ACCESS`.

| Route | Screen | Purpose | Main actions | API / store |
| --- | --- | --- | --- | --- |
| `/backoffice` | [BackofficeHome](../src/pages/backoffice/BackofficeHome.jsx) | Stub home для backoffice | Выбрать раздел или увидеть, что доступных секций нет | [user store](../src/app/user.js) |
| `/backoffice/deposit-requests` | [DepositRequests](../src/pages/backoffice/DepositRequests.jsx) | Очередь заявок на пополнение | Переключать tab `pending/all`, открывать заявку | [adminDepositRequests API](../src/api/adminDepositRequests.js) |
| `/backoffice/deposit-requests/:publicId` | [DepositRequest](../src/pages/backoffice/DepositRequest.jsx) | Карточка заявки для оператора | Выдать реквизиты, подтвердить, отклонить | [adminDepositRequests API](../src/api/adminDepositRequests.js), [deposit status helpers](../src/app/depositRequests.js) |

## Inferred from code

- `/market` выглядит как отдельный публичный раздел, но в основном navigation по коду явной ссылки на него нет.
- `/backoffice` home сейчас скорее routing stub, потому что реальный рабочий сценарий сосредоточен в deposit requests.
- В account/profile и wallet UI есть задел под расширение личного кабинета, но не весь функционал реализован.

## Open questions

- Нужен ли отдельный `404` или fallback route: в [router](../src/app/router.jsx) его нет.
- Должен ли `/login` возвращать пользователя на исходный `from`, который передают protected layouts?
- Должен ли market быть доступен из header или user navigation, если это уже публичный раздел?
