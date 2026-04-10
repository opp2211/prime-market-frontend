# Frontend Overview

## Confirmed from code

- Приложение является SPA на React 19 + Vite с маршрутизацией через [router](../src/app/router.jsx), HTTP-слоем на [axios](../src/api/http.js) и глобальными сторами на `useSyncExternalStore` для [auth](../src/app/auth.js) и [user](../src/app/user.js).
- Публичные разделы: главная [Home](../src/pages/Home.jsx), auth-flow [Login](../src/pages/Login.jsx), [Register](../src/pages/Register.jsx), [CheckEmail](../src/pages/CheckEmail.jsx), [VerifyEmail](../src/pages/VerifyEmail.jsx), а также read-only рынок [MarketPage](../src/pages/market/MarketPage.jsx).
- Авторизованный пользовательский контур строится через [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx): [Profile](../src/pages/account/Profile.jsx), [Wallet](../src/pages/account/Wallet.jsx), пополнение баланса [DepositBalance](../src/pages/account/DepositBalance.jsx), список и карточка заявок на пополнение [DepositRequests](../src/pages/account/DepositRequests.jsx), [DepositRequest](../src/pages/account/DepositRequest.jsx), а также CRUD по офферам в [myOffers](../src/pages/myOffers).
- Админский контур строится через [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx) и завязан на permissions `BACKOFFICE_ACCESS` и `DEPOSIT_APPROVE`.
- Auth-модель:
  - access token хранится в `localStorage` (`pm_access_token`, `pm_token_type`) в [auth store](../src/app/auth.js);
  - refresh вызывается через `/api/auth/refresh` с `withCredentials: true`;
  - axios-interceptor автоматически добавляет `Authorization` и пробует refresh при `401` в [http client](../src/api/http.js).
- Data fetching построен page-by-page через `useEffect + useState`; React Query, SWR, Redux Toolkit Query и аналогов в проекте нет.
- Формы реализованы вручную без `react-hook-form`, `zod`, `yup` и подобных библиотек:
  - login/register/check-email/deposit/backoffice actions используют локальный state и ручные валидаторы;
  - форма оффера в [OfferForm](../src/pages/myOffers/OfferForm.jsx) schema-driven и зависит от backend schema из [offers API](../src/api/offers.js).
- Локализация есть в [i18n provider](../src/app/i18n.jsx), тема хранится в `localStorage` через [theme](../src/app/theme.js).
- Подтвержденные пользовательские роли, видимые в UI:
  - обычный авторизованный пользователь;
  - backoffice-пользователь с доступом к модерации депозитов.

## Inferred from code

- Frontend покрывает только часть продукта: здесь есть onboarding, профиль, кошелек, пополнение, публикация офферов и публичный market browse, но нет полного торгового цикла заказа.
- Backoffice-пользователь выглядит скорее как оператор ручной обработки депозитов, а не как полнофункциональный администратор продукта.
- `market` пока работает как витрина офферов по валюте, а не как полноценный buy/sell flow.

## Open questions

- Должны ли пользователи с `BACKOFFICE_ACCESS` иметь доступ к обычным пользовательским экранам, или принудительный редирект в `/backoffice` сделан намеренно?
- Является ли кнопка `Withdraw` в [Wallet](../src/pages/account/Wallet.jsx) заглушкой или для нее ожидается отдельный flow?
- Должны ли роли (`roles`) из [user store](../src/app/user.js) влиять на UI, или единственный источник прав здесь только `permissions`?
