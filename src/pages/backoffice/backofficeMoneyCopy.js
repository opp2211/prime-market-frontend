const BACKOFFICE_MONEY_MESSAGES = {
  ru: {
    common: {
      title: 'Money Backoffice',
      subtitle:
        'Операторская секция для очередей пополнений и выводов с быстрым доступом к действиям.',
      noAccessTitle: 'Нет доступа к разделу',
      noAccessText:
        'Этот раздел скрыт, если у пользователя нет нужных permission codes для money backoffice.',
      searchLabel: 'Поиск по ID',
      searchPlaceholder: 'Введите public ID заявки',
      filtersTitle: 'Фильтры',
      refresh: 'Обновить',
      clearFilters: 'Сбросить фильтры',
      queueActionable: 'Требуют действия',
      queueAll: 'Все заявки',
      user: 'Пользователь',
      userId: 'User ID',
      userAccountId: 'Wallet ID',
      notAssigned: 'Не назначено',
      assignment: 'Обработка',
      assignee: 'В работе у',
      processedBy: 'Обработал',
      methodSnapshot: 'Снимок метода',
      requestOverview: 'Сводка заявки',
      requestQueue: 'К очереди',
      lastChange: 'Последнее изменение',
      noActionsTitle: 'Действий сейчас нет',
      noActionsText:
        'Текущий статус не требует операторского шага или у пользователя нет нужного права.',
      loadingIdentity: 'Загружаем идентификатор…',
      successIssued: 'Реквизиты выданы.',
      successConfirmed: 'Заявка подтверждена.',
      successRejected: 'Заявка отклонена.',
      successTaken: 'Заявка взята в работу.',
      fieldOptional: 'Необязательно',
      openHint: 'Нажмите, чтобы открыть карточку заявки',
      importantAt: 'Ключевое время',
      queuedTotal: 'Всего в выборке',
    },
    hub: {
      title: 'Money Backoffice',
      subtitle:
        'Две основные очереди для денежных операций: пополнения и выводы. Disputes остаются рядом в том же shell.',
      depositsTitle: 'Deposit requests',
      depositsText:
        'Ручная выдача реквизитов, проверка оплаты и финальное подтверждение входящих средств.',
      withdrawalsTitle: 'Withdrawal requests',
      withdrawalsText:
        'Взятие вывода в работу, безопасное подтверждение выплаты и отклонение с обязательной причиной.',
      disputesTitle: 'Disputes',
      disputesText:
        'Существующий dispute review flow остаётся доступен через тот же backoffice shell.',
      openSection: 'Открыть раздел',
    },
    deposits: {
      navLabel: 'Deposit requests',
      title: 'Deposit requests',
      subtitle:
        'Очередь ручных пополнений с фильтрами по статусу, валюте и методу, плюс быстрый переход в детальную карточку.',
      detailSubtitle:
        'Проверьте статус, платежные реквизиты и таймлайн заявки перед выдачей деталей или подтверждением.',
      emptyTitle: 'Заявок на пополнение нет',
      emptyText:
        'Попробуйте сбросить фильтры или вернитесь позже, когда появятся новые manual deposit requests.',
      metrics: {
        actionable: 'Требуют действия',
        waiting: 'Ждут оплаты',
        total: 'Всего в очереди',
      },
      columns: {
        request: 'Заявка',
        user: 'Пользователь',
        amount: 'Сумма',
        method: 'Метод',
        status: 'Статус',
      },
      methodSnapshotTitle: 'Снимок метода',
      paymentDetailsTitle: 'Платёжные реквизиты',
      issueTitle: 'Выдать реквизиты',
      issueText:
        'Введите реквизиты в удобном формате. Backend сохранит строку как snapshot платежных деталей заявки.',
      issueAction: 'Выдать реквизиты',
      confirmTitle: 'Подтвердить пополнение',
      confirmText:
        'Подтверждайте заявку только после ручной проверки входящего перевода и соответствия суммы.',
      confirmAction: 'Подтвердить пополнение',
      rejectTitle: 'Отклонить заявку',
      rejectText:
        'Отклонение доступно только на этапе проверки оплаты. Причина сохраняется в карточке заявки.',
      rejectAction: 'Отклонить заявку',
      awaitingIdentity: 'ID пользователя подтягивается из detail response',
    },
    withdrawals: {
      navLabel: 'Withdrawal requests',
      title: 'Withdrawal requests',
      subtitle:
        'Очередь выводов с операционными статусами, привязкой к оператору и безопасными confirm/reject flow.',
      detailSubtitle:
        'Откройте снимок реквизитов, посмотрите текущего оператора и завершите take, reject или confirm flow.',
      emptyTitle: 'Заявок на вывод нет',
      emptyText:
        'Для выбранных фильтров очередь пуста. Сбросьте фильтры или дождитесь новых withdrawal requests.',
      metrics: {
        open: 'Открыты',
        processing: 'В обработке',
        total: 'Всего в очереди',
      },
      columns: {
        request: 'Заявка',
        user: 'Пользователь',
        amounts: 'Суммы',
        method: 'Метод',
        assignment: 'Обработка',
        status: 'Статус',
      },
      requisitesTitle: 'Снимок реквизитов',
      methodNoteTitle: 'Примечание по методу',
      takeTitle: 'Взять в работу',
      takeText:
        'После этого статус перейдёт в PROCESSING, а `processed_by_user_id` закрепится за текущим оператором.',
      takeAction: 'Взять в работу',
      confirmTitle: 'Подтвердить выплату',
      confirmText:
        'Перед подтверждением проверьте факт внешней выплаты. При необходимости скорректируйте actual payout amount.',
      confirmIntent: 'Подтверждаю, что выплата уже отправлена вручную',
      confirmAction: 'Подтвердить выплату',
      confirmAmountLabel: 'Фактическая сумма выплаты',
      confirmAmountPlaceholder: 'Например, 995.0000',
      rejectTitle: 'Отклонить вывод',
      rejectText:
        'Причина отклонения обязательна. Комментарий оператора остаётся в карточке и помогает при разборе кейса.',
      rejectAction: 'Отклонить вывод',
      rejectionReasonLabel: 'Причина отклонения',
      rejectionReasonPlaceholder: 'Укажите причину отклонения',
      commentLabel: 'Комментарий оператора',
      commentPlaceholder: 'Добавьте внутренний комментарий, если он поможет следующему оператору',
      safetyTitle: 'Безопасное подтверждение',
      safetyText:
        'Confirm вынесен в отдельную форму с явным чекбоксом, чтобы не подтверждать выплату случайным кликом.',
    },
  },
  en: {
    common: {
      title: 'Money Backoffice',
      subtitle:
        'Operator-facing queues for deposit and withdrawal processing with clear access to actions.',
      noAccessTitle: 'No access to this section',
      noAccessText:
        "This section stays hidden when the current user doesn't have the required money backoffice permissions.",
      searchLabel: 'Search by ID',
      searchPlaceholder: 'Enter request public ID',
      filtersTitle: 'Filters',
      refresh: 'Refresh',
      clearFilters: 'Clear filters',
      queueActionable: 'Needs action',
      queueAll: 'All requests',
      user: 'User',
      userId: 'User ID',
      userAccountId: 'Wallet ID',
      notAssigned: 'Unassigned',
      assignment: 'Assignment',
      assignee: 'Taken by',
      processedBy: 'Processed by',
      methodSnapshot: 'Method snapshot',
      requestOverview: 'Request overview',
      requestQueue: 'Back to queue',
      lastChange: 'Last change',
      noActionsTitle: 'No actions available',
      noActionsText:
        "The current status doesn't require an operator step, or this user doesn't have the needed permission.",
      loadingIdentity: 'Loading identity…',
      successIssued: 'Payment details were issued.',
      successConfirmed: 'The request was confirmed.',
      successRejected: 'The request was rejected.',
      successTaken: 'The request was taken in work.',
      fieldOptional: 'Optional',
      openHint: 'Open request details',
      importantAt: 'Key timestamp',
      queuedTotal: 'Total in scope',
    },
    hub: {
      title: 'Money Backoffice',
      subtitle:
        'Two main queues for money operations: deposits and withdrawals. Existing disputes stay in the same shell.',
      depositsTitle: 'Deposit requests',
      depositsText:
        'Manual payment details issuing, payment verification, and final confirmation of incoming funds.',
      withdrawalsTitle: 'Withdrawal requests',
      withdrawalsText:
        'Take a payout in work, confirm it safely, or reject it with a required reason.',
      disputesTitle: 'Disputes',
      disputesText:
        'The current dispute review flow remains available in the same backoffice shell.',
      openSection: 'Open section',
    },
    deposits: {
      navLabel: 'Deposit requests',
      title: 'Deposit requests',
      subtitle:
        'Manual top-up queue with status, currency, and method filters plus direct access to the detail card.',
      detailSubtitle:
        'Review status, payment details, and request timeline before issuing details or confirming the deposit.',
      emptyTitle: 'No deposit requests found',
      emptyText:
        'Try clearing the filters or come back later when new manual deposit requests arrive.',
      metrics: {
        actionable: 'Needs action',
        waiting: 'Waiting for payment',
        total: 'Requests in queue',
      },
      columns: {
        request: 'Request',
        user: 'User',
        amount: 'Amount',
        method: 'Method',
        status: 'Status',
      },
      methodSnapshotTitle: 'Method snapshot',
      paymentDetailsTitle: 'Payment details',
      issueTitle: 'Issue payment details',
      issueText:
        'Enter payment details in any convenient format. Backend stores the string as the request snapshot.',
      issueAction: 'Issue payment details',
      confirmTitle: 'Confirm deposit',
      confirmText:
        'Confirm only after manually checking the incoming payment and matching the amount.',
      confirmAction: 'Confirm deposit',
      rejectTitle: 'Reject request',
      rejectText:
        'Rejection is available only during payment verification. The reason is stored on the request card.',
      rejectAction: 'Reject request',
      awaitingIdentity: 'User identity is fetched from the detail response',
    },
    withdrawals: {
      navLabel: 'Withdrawal requests',
      title: 'Withdrawal requests',
      subtitle:
        'Operator queue for payouts with status visibility, assignee context, and safe confirm/reject flows.',
      detailSubtitle:
        'Open the requisites snapshot, inspect the assigned operator, and complete the take, reject, or confirm flow.',
      emptyTitle: 'No withdrawal requests found',
      emptyText:
        'The queue is empty for the selected filters. Clear the filters or wait for new withdrawal requests.',
      metrics: {
        open: 'Open',
        processing: 'Processing',
        total: 'Requests in queue',
      },
      columns: {
        request: 'Request',
        user: 'User',
        amounts: 'Amounts',
        method: 'Method',
        assignment: 'Assignment',
        status: 'Status',
      },
      requisitesTitle: 'Requisites snapshot',
      methodNoteTitle: 'Method note',
      takeTitle: 'Take in work',
      takeText:
        'This moves the request into PROCESSING and stores the current operator in `processed_by_user_id`.',
      takeAction: 'Take in work',
      confirmTitle: 'Confirm payout',
      confirmText:
        'Verify that the external payout is already sent. Adjust the actual payout amount if the net payout differs.',
      confirmIntent: 'I confirm that the payout has already been sent manually',
      confirmAction: 'Confirm payout',
      confirmAmountLabel: 'Actual payout amount',
      confirmAmountPlaceholder: 'For example, 995.0000',
      rejectTitle: 'Reject withdrawal',
      rejectText:
        'A rejection reason is required. Operator comment stays on the request and helps the next review.',
      rejectAction: 'Reject withdrawal',
      rejectionReasonLabel: 'Rejection reason',
      rejectionReasonPlaceholder: 'Provide the rejection reason',
      commentLabel: 'Operator comment',
      commentPlaceholder: 'Add an internal comment if it helps the next operator',
      safetyTitle: 'Safe confirmation',
      safetyText:
        'Confirm is placed inside a dedicated form with an explicit checkbox to avoid accidental payout confirmation.',
    },
  },
}

export function getBackofficeMoneyCopy(language = 'ru') {
  return BACKOFFICE_MONEY_MESSAGES[language] || BACKOFFICE_MONEY_MESSAGES.ru
}

