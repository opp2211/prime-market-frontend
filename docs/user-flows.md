# User Flows

## Confirmed from code

### Регистрация и подтверждение email

- Happy path:
  - пользователь открывает [Register](../src/pages/Register.jsx);
  - заполняет `username`, `email`, `password`, `passwordConfirm`;
  - frontend вызывает `POST /auth/register` через [auth API](../src/api/auth.js);
  - после успеха происходит переход на `/check-email?email=...`;
  - на `/verify-email?token=...` frontend вызывает `POST /auth/verify-email`, получает auth response и логинит пользователя через [auth store](../src/app/auth.js).
- Альтернативные ветки:
  - локальная валидация режет пустые поля, плохой email, длину username и несовпадение паролей;
  - на `CheckEmail` можно повторно отправить письмо;
  - на `VerifyEmail` без token сразу показывается error state.
- Backend-логика неочевидна:
  - нет подтверждения, требуется ли email verification всегда или только для local registration.
- Основано на:
  - [Register](../src/pages/Register.jsx)
  - [CheckEmail](../src/pages/CheckEmail.jsx)
  - [VerifyEmail](../src/pages/VerifyEmail.jsx)
  - [auth API](../src/api/auth.js)

### Логин и выход

- Happy path:
  - пользователь вводит email/password в [Login](../src/pages/Login.jsx);
  - frontend вызывает `POST /auth/login`;
  - при успехе сохраняет `accessToken/tokenType` в [auth store](../src/app/auth.js) и идет на `/`;
  - logout из [Header](../src/widgets/Header.jsx) вызывает `POST /auth/logout`, затем чистит auth.
- Альтернативные ветки:
  - `EMAIL_NOT_VERIFIED` переводит экран в состояние resend verification;
  - `401/403` показывают invalid credentials;
  - можно стартовать OAuth через редирект на `/api/auth/oauth/{provider}`.
- Backend-логика неочевидна:
  - логин не использует `location.state.from`, хотя protected layouts его передают.
- Основано на:
  - [Login](../src/pages/Login.jsx)
  - [Header](../src/widgets/Header.jsx)
  - [auth store](../src/app/auth.js)

### Доступ к protected area и backoffice

- Happy path:
  - [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx) пускает только при `isReady && isAuthed`;
  - [App](../src/app/App.jsx) после auth загружает `/users/me`;
  - если у пользователя есть `BACKOFFICE_ACCESS`, [App](../src/app/App.jsx) отправляет его в `/backoffice`;
  - [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx) дополнительно проверяет permissions.
- Альтернативные ветки:
  - неавторизованный пользователь уходит на `/login`;
  - если `/users/me` упал в backoffice, показывается error state.
- Backend-логика неочевидна:
  - неясно, может ли оператор работать одновременно с user-area и backoffice.
- Основано на:
  - [App](../src/app/App.jsx)
  - [UserAreaLayout](../src/pages/account/UserAreaLayout.jsx)
  - [BackofficeLayout](../src/pages/backoffice/BackofficeLayout.jsx)
  - [user store](../src/app/user.js)

### Просмотр профиля

- Happy path:
  - пользователь открывает `/account/profile`;
  - frontend грузит `/users/me`;
  - показывает username, email, status, created date.
- Альтернативные ветки:
  - loading и error состояния.
- Backend-логика неочевидна:
  - CTA `Edit profile` и `Change email` пока без действий.
- Основано на:
  - [Profile](../src/pages/account/Profile.jsx)
  - [users API](../src/api/users.js)

### Работа с балансом и транзакциями

- Happy path:
  - пользователь открывает `/account/wallet`;
  - frontend грузит кошельки через `/wallets/me` и транзакции через `/wallets/me/txs`;
  - можно фильтровать историю по валютам и типам;
  - кнопка `Deposit` ведет в `/account/deposit`.
- Альтернативные ветки:
  - empty wallet;
  - empty transactions;
  - независимые error/loading для кошельков и транзакций.
- Backend-логика неочевидна:
  - `Withdraw` визуально есть, но сценарий не реализован.
- Основано на:
  - [Wallet](../src/pages/account/Wallet.jsx)
  - [wallets API](../src/api/wallets.js)

### Создание заявки на пополнение

- Happy path:
  - в [DepositBalance](../src/pages/account/DepositBalance.jsx) пользователь выбирает валюту;
  - frontend загружает доступные методы оплаты;
  - пользователь выбирает метод, вводит сумму;
  - frontend вызывает `POST /deposit-requests`;
  - при успехе переходит в `/account/deposit-requests/:publicId`.
- Альтернативные ветки:
  - ошибка загрузки валют;
  - ошибка загрузки методов;
  - пустой список методов;
  - локальная ошибка по методу или сумме.
- Backend-логика неочевидна:
  - авто/ручное подтверждение определяется только по `auto_confirmation`;
  - минимальные/максимальные суммы не известны фронту.
- Основано на:
  - [DepositBalance](../src/pages/account/DepositBalance.jsx)
  - [deposit API](../src/api/deposit.js)
  - [depositRequests API](../src/api/depositRequests.js)

### Просмотр и управление своей заявкой на пополнение

- Happy path:
  - пользователь открывает список [DepositRequests](../src/pages/account/DepositRequests.jsx);
  - открывает карточку [DepositRequest](../src/pages/account/DepositRequest.jsx);
  - может копировать ID и payment details;
  - в статусе `WAITING_PAYMENT` может нажать `Paid`;
  - в статусах `PENDING_DETAILS`, `WAITING_PAYMENT`, `PAYMENT_VERIFICATION` может нажать `Cancel`.
- Альтернативные ветки:
  - loading, empty, error;
  - если `payment_details` нет, показывается отдельный pending state.
- Backend-логика неочевидна:
  - нет подтверждения действиям `Paid` и `Cancel`;
  - неясно, нужно ли прикладывать подтверждение оплаты.
- Основано на:
  - [DepositRequests](../src/pages/account/DepositRequests.jsx)
  - [DepositRequest](../src/pages/account/DepositRequest.jsx)
  - [deposit status helpers](../src/app/depositRequests.js)

### Обработка заявки оператором backoffice

- Happy path:
  - оператор открывает `/backoffice/deposit-requests`;
  - tab `Pending actions` грузит только `PENDING_DETAILS` и `PAYMENT_VERIFICATION`;
  - на карточке заявки:
    - для `PENDING_DETAILS` можно выдать реквизиты;
    - для `PAYMENT_VERIFICATION` можно подтвердить;
    - для обоих статусов можно отклонить.
- Альтернативные ветки:
  - loading/error на списке и карточке;
  - пустой список;
  - локальная ошибка, если пусты `payment details` или `reject reason`.
- Backend-логика неочевидна:
  - нет явной проверки, кто и когда может повторно выдать реквизиты или повторно reject;
  - нет UI для редактирования уже выданных реквизитов.
- Основано на:
  - [Backoffice DepositRequests](../src/pages/backoffice/DepositRequests.jsx)
  - [Backoffice DepositRequest](../src/pages/backoffice/DepositRequest.jsx)
  - [adminDepositRequests API](../src/api/adminDepositRequests.js)

### Создание, редактирование и публикация оффера

- Happy path:
  - пользователь открывает `/my-offers/new` или `/my-offers/:offerId/edit`;
  - frontend грузит игры, категории и schema оффера;
  - пользователь заполняет базовые поля, dynamic contexts, attributes и trade terms;
  - create вызывает `POST /offers`, edit вызывает `PATCH /offers/:id`;
  - после успеха пользователь возвращается в список с notice.
- Альтернативные ветки:
  - loading skeleton;
  - retry для games/categories/schema/offer;
  - локальная валидация не дает submit;
  - edit блокирует save при отсутствии изменений.
- Backend-логика неочевидна:
  - create всегда публикует оффер как `active`;
  - различие между omitted, `null` и `[]` в PATCH критично, но серверный контракт отсюда не виден.
- Основано на:
  - [MyOffersPage](../src/pages/myOffers/MyOffersPage.jsx)
  - [OfferForm](../src/pages/myOffers/OfferForm.jsx)
  - [offerFormUtils](../src/pages/myOffers/offerFormUtils.js)
  - [offers API](../src/api/offers.js)

### Просмотр публичного рынка

- Happy path:
  - пользователь открывает `/market`;
  - frontend грузит игры, затем категории, затем schema, затем список офферов;
  - пользователь настраивает intent/filters/sort/pagination;
  - можно открыть modal с подробностями оффера.
- Альтернативные ветки:
  - market skeleton;
  - blocked/unsupported state;
  - empty state;
  - error state c retry.
- Backend-логика неочевидна:
  - primary CTA в modal disabled, order creation не реализован;
  - поддерживается только category `currency`.
- Основано на:
  - [MarketPage](../src/pages/market/MarketPage.jsx)
  - [MarketToolbar](../src/pages/market/MarketToolbar.jsx)
  - [MarketOfferModal](../src/pages/market/MarketOfferModal.jsx)
  - [market API](../src/api/market.js)

## Inferred from code

- Полного flow удаления сущностей нет: для офферов есть только publish/pause, для депозитов cancel, но hard delete в UI не найден.
- Заказов и споров как пользовательских сценариев во frontend сейчас нет.

## Open questions

- Нужен ли пользовательский flow после открытия market-offer modal, или read-only режим пока является конечной точкой?
- Должен ли create offer поддерживать `draft`, если статус `draft` уже отрисовывается в presentation helpers?
