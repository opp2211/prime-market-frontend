const ORDER_MESSAGES = {
  ru: {
    navLabel: '\u041c\u043e\u0438 \u0441\u0434\u0435\u043b\u043a\u0438',
    common: {
      loading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...',
      refreshing: '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c...',
      retry: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c',
      noValue: '\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u043e',
      all: '\u0412\u0441\u0435',
      page: '\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430',
      of: '\u0438\u0437',
      results: '\u0441\u0434\u0435\u043b\u043e\u043a',
      fallbackTitle: '\u0421\u0434\u0435\u043b\u043a\u0430 \u0431\u0435\u0437 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f',
      counterpartyFallback: '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a',
    },
    errors: {
      list: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0438.',
      details:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0435\u0442\u0430\u043b\u0438 \u0441\u0434\u0435\u043b\u043a\u0438.',
      history:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u0441\u0434\u0435\u043b\u043a\u0438.',
      action:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0443.',
    },
    success: {
      confirmReady:
        '\u0413\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430.',
      cancel: '\u0421\u0434\u0435\u043b\u043a\u0430 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430.',
      partialDelivery: 'Прогресс передачи обновлён.',
      markDelivered: 'Полная передача подтверждена.',
      confirmReceived: 'Получение подтверждено. Сделка завершена.',
      requestCancel:
        'Запрос на отмену отправлен. Вторая сторона должна подтвердить его.',
      requestAmendQuantity:
        'Запрос на изменение объёма отправлен. Ожидаем решения второй стороны.',
      requestApprove: 'Запрос подтверждён.',
      requestReject: 'Запрос отклонён.',
    },
    filters: {
      status: '\u0421\u0442\u0430\u0442\u0443\u0441',
      role: '\u041c\u043e\u044f \u0440\u043e\u043b\u044c',
    },
    empty: {
      title: '\u0421\u0434\u0435\u043b\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442',
      subtitle:
        '\u041a\u043e\u0433\u0434\u0430 \u043d\u0430 \u043c\u0430\u0440\u043a\u0435\u0442\u0435 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0432\u0430\u0448\u0438 \u0441\u0434\u0435\u043b\u043a\u0438, \u0437\u0434\u0435\u0441\u044c \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u043e\u0431\u043d\u0430\u044f \u0441\u0432\u043e\u0434\u043a\u0430 \u043f\u043e \u0438\u0445 \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u043c \u0438 \u0434\u0435\u0442\u0430\u043b\u044f\u043c.',
      cta: '\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u043c\u0430\u0440\u043a\u0435\u0442\u0443',
    },
    list: {
      title: '\u041c\u043e\u0438 \u0441\u0434\u0435\u043b\u043a\u0438',
      subtitle:
        '\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044b, \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0439\u0442\u0435 \u043a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442\u0430 \u0438 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442\u0435 \u043a \u0434\u0435\u0442\u0430\u043b\u044f\u043c \u0431\u0435\u0437 \u043b\u0438\u0448\u043d\u0438\u0445 \u0448\u0430\u0433\u043e\u0432.',
      showingSummary: (visible, total) =>
        `\u041f\u043e\u043a\u0430\u0437\u0430\u043d\u043e ${visible} \u0438\u0437 ${total}`,
      awaitingSummary: (count) => `${count} \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f`,
      activeSummary: (count) => `${count} \u0432 \u0440\u0430\u0431\u043e\u0442\u0435`,
      showing: '\u041f\u043e\u043a\u0430\u0437\u0430\u043d\u043e',
      columns: {
        order: '\u0421\u0434\u0435\u043b\u043a\u0430',
        counterparty: '\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442',
        summary: '\u0421\u0443\u043c\u043c\u0430 \u0438 \u043e\u0431\u044a\u0451\u043c',
        status: '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435',
      },
      open: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c',
      quantity: '\u041e\u0431\u044a\u0451\u043c',
      delivered: '\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e',
      total: '\u041d\u0430 \u0441\u0443\u043c\u043c\u0443',
      attention: '\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f',
      previous: '\u041d\u0430\u0437\u0430\u0434',
      next: '\u0414\u0430\u043b\u0435\u0435',
      loadingRefresh:
        '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u0441\u043f\u0438\u0441\u043e\u043a',
      dateExpires: '\u0418\u0441\u0442\u0435\u043a\u0430\u0435\u0442',
      dateCreated: '\u0421\u043e\u0437\u0434\u0430\u043d\u0430',
      dateUpdated: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430',
    },
    details: {
      back: '\u041a \u0441\u043f\u0438\u0441\u043a\u0443 \u0441\u0434\u0435\u043b\u043e\u043a',
      orderId: 'ID',
      refreshing:
        '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u0434\u0435\u0442\u0430\u043b\u0438',
      summaryTitle: '\u0421\u0432\u043e\u0434\u043a\u0430',
      summarySubtitle:
        '\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u0442\u0435\u043a\u0443\u0449\u0435\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435.',
      total: '\u0418\u0442\u043e\u0433\u043e',
      unitPrice: '\u0426\u0435\u043d\u0430 \u0437\u0430 \u0435\u0434\u0438\u043d\u0438\u0446\u0443',
      quantity: '\u041e\u0431\u044a\u0451\u043c',
      delivered: '\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e',
      counterparty: '\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442',
      expiresAt: '\u0418\u0441\u0442\u0435\u043a\u0430\u0435\u0442',
      createdAt: '\u0421\u043e\u0437\u0434\u0430\u043d\u0430',
      updatedAt: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430',
      stageLabel: 'Текущий этап',
      actionsTitle: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f',
      actionsSubtitle:
        '\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c \u0442\u043e\u043b\u044c\u043a\u043e \u0442\u0435 \u0448\u0430\u0433\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u043f\u043e \u0442\u0435\u043a\u0443\u0449\u0435\u043c\u0443 \u0441\u0442\u0430\u0442\u0443\u0441\u0443.',
      confirmReady:
        '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c',
      confirmReadyLoading:
        '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u043c \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c...',
      cancel:
        '\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0443',
      cancelLoading: '\u041e\u0442\u043c\u0435\u043d\u044f\u0435\u043c...',
      cancelConfirmTitle:
        '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043e\u0442\u043c\u0435\u043d\u0443',
      cancelConfirmText:
        '\u0421\u0434\u0435\u043b\u043a\u0430 \u0431\u0443\u0434\u0435\u0442 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430 \u0434\u043b\u044f \u043e\u0431\u0435\u0438\u0445 \u0441\u0442\u043e\u0440\u043e\u043d.',
      cancelConfirmAction: '\u0414\u0430, \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c',
      cancelDismiss: '\u041d\u0435 \u043e\u0442\u043c\u0435\u043d\u044f\u0442\u044c',
      actionGroups: {
        readyTitle: 'Готовность к сделке',
        readyText: 'Подтвердите, что вы готовы перейти к исполнению сделки.',
        sellerDeliveryTitle: 'Передача товара',
        sellerDeliveryText:
          'Фиксируйте прогресс передачи по мере исполнения заказа: частично или полностью.',
        buyerCompletionTitle: 'Подтверждение получения',
        buyerCompletionText:
          'Подтверждайте получение только после полной передачи товара продавцом.',
        cancelTitle: 'Отмена сделки',
        cancelText: 'Это действие остановит сделку для обеих сторон.',
        requestTitle: 'Запросы по сделке',
        requestText:
          'Отправьте второй стороне запрос на отмену или изменение объёма, если backend разрешает это действие.',
      },
      requestCancel: {
        button: 'Запросить отмену',
        loading: 'Отправляем запрос...',
        confirmTitle: 'Запросить отмену сделки',
        confirmText:
          'Сделка не будет отменена сразу. Вторая сторона увидит запрос и должна будет подтвердить его.',
        confirmAction: 'Отправить запрос',
        dismiss: 'Вернуться',
      },
      amendQuantity: {
        button: 'Изменить объём',
        hide: 'Скрыть форму',
        title: 'Запросить изменение объёма',
        description:
          'Укажите новый общий объём заказа. Это не меняет цену вручную и вступит в силу только после подтверждения второй стороной.',
        inputLabel: 'Новый объём заказа',
        inputPlaceholder: 'Например, 650',
        hint: (ordered, delivered) =>
          `Сейчас заказано ${ordered}, доставлено ${delivered}. Новый объём должен быть не меньше доставленного. Шаг и лимиты лота проверит backend, а вторая сторона должна подтвердить запрос.`,
        submit: 'Отправить запрос',
        submitting: 'Отправляем запрос...',
        dismiss: 'Отмена',
        validationRequired: 'Укажите новый объём заказа.',
        validationNumber: 'Введите корректное число.',
        validationPositive: 'Введите значение больше нуля.',
        validationDelivered: (delivered) =>
          `Новый объём не может быть меньше уже доставленного: ${delivered}.`,
      },
      requests: {
        title: 'Ожидают подтверждения',
        description:
          'Активные запросы по отмене и изменению объёма. Действия доступны только стороне, которая должна принять решение.',
        refreshing: 'Обновляем запросы',
        emptyTitle: 'Ожидающих запросов нет',
        emptyText:
          'Когда одна из сторон запросит отмену или изменение объёма, запрос появится здесь.',
        noActions: 'Сейчас по этим запросам не нужно действие с вашей стороны.',
        typeLabel: 'Тип',
        requestedBy: 'Создал',
        createdAt: 'Создан',
        status: 'Статус',
        requestedQuantity: 'Запрошенный объём',
        waitingYourDecision: 'Ожидает вашего решения.',
        waitingCounterpartyDecision: 'Ожидает решения второй стороны.',
        cancelSummary: (roleLabel) => `${roleLabel} запросил отмену сделки.`,
        amendQuantitySummary: (quantityLabel, roleLabel) =>
          `${roleLabel} запросил изменить объём на ${quantityLabel}.`,
        approve: 'Подтвердить',
        reject: 'Отклонить',
        approveLoading: 'Подтверждаем...',
        rejectLoading: 'Отклоняем...',
        approveConfirmTitle: 'Подтвердить запрос',
        rejectConfirmTitle: 'Отклонить запрос',
        approveConfirmText:
          'После подтверждения backend применит запрос к сделке и обновит историю.',
        rejectConfirmText:
          'После отклонения запрос перестанет ждать решения, а сделка останется в текущем состоянии.',
        confirmAction: 'Да, продолжить',
        dismiss: 'Вернуться',
      },
      progress: {
        title: 'Прогресс передачи',
        description: 'Текущий объём исполнения заказа и оставшаяся часть передачи.',
        deliveredOfTotal: (delivered, total) => `${delivered} из ${total}`,
        completionLabel: (percent) => `${percent}% выполнено`,
        sellerReported: (delivered, total) =>
          `Вы отметили передачу ${delivered} из ${total}.`,
        buyerReported: (delivered, total) =>
          `Продавец отметил передачу ${delivered} из ${total}.`,
        sellerDelivered:
          'Вы подтвердили полную передачу. Ожидаем подтверждения получения от покупателя.',
        buyerDelivered:
          'Продавец отметил полную передачу. Проверьте получение и подтвердите завершение сделки.',
        sellerCompleted: 'Покупатель подтвердил получение. Сделка завершена.',
        buyerCompleted: 'Вы подтвердили получение. Сделка завершена.',
      },
      partialDelivery: {
        button: 'Частично передано',
        hide: 'Скрыть форму',
        title: 'Зафиксировать частичную передачу',
        description: 'Укажите общий объём, который уже передан покупателю.',
        inputLabel: 'Общий объём переданного',
        inputPlaceholder: 'Например, 300',
        hint: (current, ordered) =>
          `Сейчас отмечено ${current} из ${ordered}. Новое значение должно быть больше текущего и меньше полного объёма.`,
        submit: 'Сохранить прогресс',
        submitting: 'Сохраняем прогресс...',
        dismiss: 'Отмена',
        validationRequired: 'Укажите объём передачи.',
        validationNumber: 'Введите корректное число.',
        validationGreater: (current) => `Введите значение больше ${current}.`,
        validationLess: (ordered) =>
          `Введите значение меньше ${ordered}. Для полной передачи используйте отдельное подтверждение.`,
      },
      markDelivered: {
        button: 'Товар передан',
        loading: 'Подтверждаем передачу...',
        confirmTitle: 'Подтвердить полную передачу',
        confirmText:
          'Подтвердите, что весь объём передан покупателю. После этого покупатель сможет подтвердить получение.',
        confirmAction: 'Подтвердить передачу',
        dismiss: 'Вернуться',
      },
      confirmReceived: {
        button: 'Товар получен',
        loading: 'Подтверждаем получение...',
        confirmTitle: 'Подтвердить получение',
        confirmText:
          'Подтвердите получение только после полной передачи товара. Это завершит заказ, и расчёт будет финализирован.',
        confirmAction: 'Подтвердить получение',
        dismiss: 'Пока не подтверждать',
      },
      unavailable:
        '\u0421\u0435\u0439\u0447\u0430\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u043d\u0435\u0442.',
      emptyText:
        '\u0414\u0430\u043d\u043d\u044b\u0435 \u0435\u0449\u0451 \u043d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b.',
      sections: {
        overview: '\u041e\u0431\u0437\u043e\u0440 \u0441\u0434\u0435\u043b\u043a\u0438',
        overviewText:
          '\u0421\u0442\u043e\u0440\u043e\u043d\u044b \u0441\u0434\u0435\u043b\u043a\u0438, ID \u0438 \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u0434\u0430\u0442\u044b.',
        conditions: '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0441\u0434\u0435\u043b\u043a\u0438',
        conditionsText:
          '\u041e\u0431\u044a\u0451\u043c, \u0446\u0435\u043d\u0430 \u0438 \u0441\u0442\u0430\u0442\u0443\u0441 \u0438\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f.',
        item: '\u0414\u0435\u0442\u0430\u043b\u0438 \u043b\u043e\u0442\u0430',
        itemText:
          '\u0418\u0433\u0440\u043e\u0432\u043e\u0439 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u0438 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u0441\u0434\u0435\u043b\u043a\u0438.',
        delivery: '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438',
        deliveryText:
          '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u043a\u0430\u043d\u0430\u043b\u044b \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438.',
        terms: '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438',
        termsText:
          '\u0414\u043e\u0433\u043e\u0432\u043e\u0440\u0451\u043d\u043d\u043e\u0441\u0442\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0432\u0430\u0436\u043d\u043e \u0443\u0447\u0435\u0441\u0442\u044c \u0434\u043e \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438.',
        description: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
        descriptionText:
          '\u041a\u0430\u043a \u043f\u0440\u043e\u0434\u0430\u0432\u0435\u0446 \u043e\u043f\u0438\u0441\u0430\u043b \u0441\u0434\u0435\u043b\u043a\u0443.',
        finance:
          '\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u0430\u044f \u0441\u0432\u043e\u0434\u043a\u0430',
        financeText:
          '\u0421\u0432\u0435\u0440\u043a\u0430 gross, fee \u0438 net \u043f\u043e \u0441\u0442\u043e\u0440\u043e\u043d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0446\u0430.',
      },
      history: {
        title: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u0434\u0435\u043b\u043a\u0438',
        description:
          '\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u044d\u0442\u0430\u043f\u044b, \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0438 \u0441\u0438\u0441\u0442\u0435\u043c\u043d\u044b\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043f\u043e \u0445\u043e\u0434\u0443 \u0441\u0434\u0435\u043b\u043a\u0438.',
        refreshing:
          '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u0438\u0441\u0442\u043e\u0440\u0438\u044e',
        emptyTitle:
          '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u0430',
        emptyText:
          '\u0421\u043e\u0431\u044b\u0442\u0438\u044f \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0437\u0434\u0435\u0441\u044c \u043f\u043e \u043c\u0435\u0440\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0435\u0451 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f.',
      },
      fields: {
        game: '\u0418\u0433\u0440\u0430',
        category: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f',
        myRole: '\u0412\u0430\u0448\u0430 \u0440\u043e\u043b\u044c',
        counterpartyRole:
          '\u0420\u043e\u043b\u044c \u043a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442\u0430',
        counterparty: '\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442',
        orderedQuantity: '\u0417\u0430\u043a\u0430\u0437\u0430\u043d\u043e',
        deliveredQuantity: '\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e',
        remainingQuantity: 'Осталось',
        completion: 'Исполнение',
        unitPrice: '\u0426\u0435\u043d\u0430 \u0437\u0430 \u0435\u0434\u0438\u043d\u0438\u0446\u0443',
        totalAmount: '\u0418\u0442\u043e\u0433\u043e',
        currency: '\u0412\u0430\u043b\u044e\u0442\u0430',
        createdAt: '\u0421\u043e\u0437\u0434\u0430\u043d\u0430',
        updatedAt: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430',
        expiresAt: '\u0418\u0441\u0442\u0435\u043a\u0430\u0435\u0442',
        gross: '\u0413\u0440\u043e\u0441\u0441',
        fee: '\u041a\u043e\u043c\u0438\u0441\u0441\u0438\u044f',
        net: '\u041a \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044e',
        contexts: '\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442',
        attributes: '\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b',
        deliveryMethods:
          '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438',
      },
    },
    roles: {
      buyer: '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c',
      seller: '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446',
      system: '\u0421\u0438\u0441\u0442\u0435\u043c\u0430',
      unknown: '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a',
    },
    requestTypes: {
      cancel: 'Отмена сделки',
      amend_quantity: 'Изменение объёма',
      unknown: 'Запрос по сделке',
    },
    requestStatus: {
      pending: 'Ожидает',
      approved: 'Подтверждён',
      rejected: 'Отклонён',
      unknown: 'Неизвестно',
    },
    subtitles: {
      buyer: (username) => `\u0412\u044b \u043f\u043e\u043a\u0443\u043f\u0430\u0435\u0442\u0435 \u0443 ${username}`,
      seller: (username) => `\u0412\u044b \u043f\u0440\u043e\u0434\u0430\u0451\u0442\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044e ${username}`,
      generic: (username) => `\u0421\u0434\u0435\u043b\u043a\u0430 \u0441 ${username}`,
    },
    status: {
      pending: '\u041e\u0436\u0438\u0434\u0430\u0435\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f',
      in_progress: '\u0412 \u0440\u0430\u0431\u043e\u0442\u0435',
      partially_delivered: '\u0427\u0430\u0441\u0442\u0438\u0447\u043d\u043e \u0434\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e',
      delivered: '\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e',
      completed: '\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e',
      canceled: '\u041e\u0442\u043c\u0435\u043d\u0435\u043d\u043e',
      expired: '\u0418\u0441\u0442\u0435\u043a\u043b\u043e',
      unknown: '\u0411\u0435\u0437 \u0441\u0442\u0430\u0442\u0443\u0441\u0430',
    },
    statusDescriptions: {
      pending:
        '\u0421\u0434\u0435\u043b\u043a\u0430 \u043e\u0436\u0438\u0434\u0430\u0435\u0442 \u043f\u0435\u0440\u0432\u044b\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439.',
      in_progress:
        '\u0421\u0434\u0435\u043b\u043a\u0430 \u0443\u0436\u0435 \u043f\u0435\u0440\u0435\u0448\u043b\u0430 \u0432 \u0430\u043a\u0442\u0438\u0432\u043d\u0443\u044e \u0444\u0430\u0437\u0443.',
      partially_delivered:
        '\u041f\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0443\u0436\u0435 \u043d\u0430\u0447\u0430\u043b\u0430\u0441\u044c, \u043d\u043e \u0435\u0449\u0451 \u043d\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430.',
      delivered:
        '\u041b\u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u043d, \u043d\u043e \u0441\u0434\u0435\u043b\u043a\u0430 \u0435\u0449\u0451 \u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u0430.',
      completed:
        '\u0421\u0434\u0435\u043b\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430.',
      canceled:
        '\u0421\u0434\u0435\u043b\u043a\u0430 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0430 \u0438 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u043d\u0430.',
      expired:
        '\u0421\u0440\u043e\u043a \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435 \u0438\u0441\u0442\u0451\u043a.',
      unknown:
        '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0435\u0449\u0451 \u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u043e.',
    },
  },
  en: {
    navLabel: 'My orders',
    common: {
      loading: 'Loading...',
      refreshing: 'Refreshing...',
      retry: 'Retry',
      noValue: 'Not specified',
      all: 'All',
      page: 'Page',
      of: 'of',
      results: 'orders',
      fallbackTitle: 'Untitled order',
      counterpartyFallback: 'Counterparty',
    },
    errors: {
      list: "Couldn't load your orders.",
      details: "Couldn't load order details.",
      history: "Couldn't load order history.",
      action: "Couldn't update the order.",
    },
    success: {
      confirmReady: 'Readiness confirmed.',
      cancel: 'Order cancelled.',
      partialDelivery: 'Delivery progress updated.',
      markDelivered: 'Full delivery confirmed.',
      confirmReceived: 'Receipt confirmed. The order is now completed.',
      requestCancel:
        'Cancel request sent. The counterparty must approve it.',
      requestAmendQuantity:
        'Quantity change request sent. Waiting for the counterparty decision.',
      requestApprove: 'Request approved.',
      requestReject: 'Request rejected.',
    },
    filters: {
      status: 'Status',
      role: 'My role',
    },
    empty: {
      title: 'No deals yet',
      subtitle:
        'Once your marketplace trades appear, this dashboard will show their status, counterparties, and next actions.',
      cta: 'Go to market',
    },
    list: {
      title: 'My orders',
      subtitle:
        'Track live deals, keep an eye on counterparties, and open the full order context without leaving the dashboard flow.',
      showingSummary: (visible, total) => `Showing ${visible} of ${total}`,
      awaitingSummary: (count) => `${count} need attention`,
      activeSummary: (count) => `${count} in progress`,
      showing: 'Showing',
      columns: {
        order: 'Deal',
        counterparty: 'Counterparty',
        summary: 'Amount and volume',
        status: 'Status',
      },
      open: 'Open',
      quantity: 'Quantity',
      delivered: 'Delivered',
      total: 'Total',
      attention: 'Needs attention',
      previous: 'Previous',
      next: 'Next',
      loadingRefresh: 'Refreshing list',
      dateExpires: 'Expires',
      dateCreated: 'Created',
      dateUpdated: 'Updated',
    },
    details: {
      back: 'Back to orders',
      orderId: 'ID',
      refreshing: 'Refreshing details',
      summaryTitle: 'Summary',
      summarySubtitle: 'Key order parameters and current operational status.',
      total: 'Total',
      unitPrice: 'Unit price',
      quantity: 'Quantity',
      delivered: 'Delivered',
      counterparty: 'Counterparty',
      expiresAt: 'Expires',
      createdAt: 'Created',
      updatedAt: 'Updated',
      stageLabel: 'Current stage',
      actionsTitle: 'Actions',
      actionsSubtitle:
        'Only the actions allowed by the current backend state are shown here.',
      confirmReady: 'Confirm ready',
      confirmReadyLoading: 'Confirming ready...',
      cancel: 'Cancel order',
      cancelLoading: 'Cancelling...',
      cancelConfirmTitle: 'Confirm cancellation',
      cancelConfirmText: 'This order will be cancelled for both participants.',
      cancelConfirmAction: 'Yes, cancel order',
      cancelDismiss: 'Keep order',
      actionGroups: {
        readyTitle: 'Ready to proceed',
        readyText: 'Confirm that you are ready to move this order into execution.',
        sellerDeliveryTitle: 'Delivery actions',
        sellerDeliveryText:
          'Record delivery progress as the order is fulfilled, either partially or in full.',
        buyerCompletionTitle: 'Receipt confirmation',
        buyerCompletionText:
          'Confirm receipt only after the seller has fully delivered the order.',
        cancelTitle: 'Cancel order',
        cancelText: 'This will stop the order for both participants.',
        requestTitle: 'Order requests',
        requestText:
          'Ask the counterparty to cancel the order or change the quantity when the backend allows it.',
      },
      requestCancel: {
        button: 'Request cancel',
        loading: 'Sending request...',
        confirmTitle: 'Request order cancellation',
        confirmText:
          'The order will not be cancelled immediately. The counterparty will need to approve this request.',
        confirmAction: 'Send request',
        dismiss: 'Go back',
      },
      amendQuantity: {
        button: 'Request quantity change',
        hide: 'Hide form',
        title: 'Request a quantity change',
        description:
          'Enter the new total order quantity. This is not a price edit and applies only after the counterparty approves it.',
        inputLabel: 'New order quantity',
        inputPlaceholder: 'For example, 650',
        hint: (ordered, delivered) =>
          `Currently ordered: ${ordered}; delivered: ${delivered}. The new quantity must not be below the delivered amount. Listing step and limits are checked by the backend, and the counterparty must approve the request.`,
        submit: 'Send request',
        submitting: 'Sending request...',
        dismiss: 'Cancel',
        validationRequired: 'Enter a new order quantity.',
        validationNumber: 'Enter a valid number.',
        validationPositive: 'Enter a value greater than zero.',
        validationDelivered: (delivered) =>
          `The new quantity cannot be below the delivered amount: ${delivered}.`,
      },
      requests: {
        title: 'Pending requests',
        description:
          'Active cancellation and quantity-change requests. Actions are shown only to the side that must decide.',
        refreshing: 'Refreshing requests',
        emptyTitle: 'No pending requests',
        emptyText:
          'Cancellation and quantity-change requests will appear here when either side creates one.',
        noActions: 'No action is needed from you on these requests right now.',
        typeLabel: 'Type',
        requestedBy: 'Created by',
        createdAt: 'Created',
        status: 'Status',
        requestedQuantity: 'Requested quantity',
        waitingYourDecision: 'Waiting for your decision.',
        waitingCounterpartyDecision: 'Waiting for the counterparty decision.',
        cancelSummary: (roleLabel) => `${roleLabel} requested order cancellation.`,
        amendQuantitySummary: (quantityLabel, roleLabel) =>
          `${roleLabel} requested quantity ${quantityLabel}.`,
        approve: 'Approve',
        reject: 'Reject',
        approveLoading: 'Approving...',
        rejectLoading: 'Rejecting...',
        approveConfirmTitle: 'Approve request',
        rejectConfirmTitle: 'Reject request',
        approveConfirmText:
          'After approval, the backend will apply the request and update the timeline.',
        rejectConfirmText:
          'After rejection, the request will stop waiting for a decision and the order will stay unchanged.',
        confirmAction: 'Yes, continue',
        dismiss: 'Go back',
      },
      progress: {
        title: 'Delivery progress',
        description: 'Track how much of the order has been delivered and what remains.',
        deliveredOfTotal: (delivered, total) => `${delivered} of ${total}`,
        completionLabel: (percent) => `${percent}% complete`,
        sellerReported: (delivered, total) =>
          `You reported ${delivered} of ${total} delivered.`,
        buyerReported: (delivered, total) =>
          `The seller reported ${delivered} of ${total} delivered.`,
        sellerDelivered:
          'You confirmed full delivery. Waiting for the buyer to confirm receipt.',
        buyerDelivered:
          'The seller confirmed full delivery. Review the handoff and confirm receipt to complete the order.',
        sellerCompleted: 'The buyer confirmed receipt. The order is complete.',
        buyerCompleted: 'You confirmed receipt. The order is complete.',
      },
      partialDelivery: {
        button: 'Mark partially delivered',
        hide: 'Hide form',
        title: 'Record a partial delivery',
        description: 'Enter the total quantity that has already been delivered to the buyer.',
        inputLabel: 'Total delivered quantity',
        inputPlaceholder: 'For example, 300',
        hint: (current, ordered) =>
          `Currently reported: ${current} of ${ordered}. The new value must be greater than the current amount and below the full order quantity.`,
        submit: 'Save progress',
        submitting: 'Saving progress...',
        dismiss: 'Cancel',
        validationRequired: 'Enter a delivered quantity.',
        validationNumber: 'Enter a valid number.',
        validationGreater: (current) => `Enter a value greater than ${current}.`,
        validationLess: (ordered) =>
          `Enter a value below ${ordered}. Use full delivery confirmation once everything is delivered.`,
      },
      markDelivered: {
        button: 'Mark delivered',
        loading: 'Confirming delivery...',
        confirmTitle: 'Confirm full delivery',
        confirmText:
          'Confirm that the full quantity has been delivered. After this step, the buyer will be able to confirm receipt.',
        confirmAction: 'Confirm delivery',
        dismiss: 'Go back',
      },
      confirmReceived: {
        button: 'Confirm received',
        loading: 'Confirming receipt...',
        confirmTitle: 'Confirm receipt',
        confirmText:
          'Confirm receipt only after the full handoff is complete. This finalizes the order and settlement.',
        confirmAction: 'Confirm receipt',
        dismiss: 'Not yet',
      },
      unavailable: 'No actions are available right now.',
      emptyText: 'This section is not filled yet.',
      sections: {
        overview: 'Deal overview',
        overviewText: 'Parties, identifiers, and key timestamps.',
        conditions: 'Trade conditions',
        conditionsText: 'Volume, pricing, and fulfillment progress.',
        item: 'Item details',
        itemText: 'Game context and item-specific parameters.',
        delivery: 'Delivery methods',
        deliveryText: 'Supported handoff channels for this trade.',
        terms: 'Trade terms',
        termsText: 'Important conditions agreed before delivery.',
        description: 'Description',
        descriptionText: 'How the listing owner described the deal.',
        finance: 'Finance summary',
        financeText: 'Seller-side gross, fee, and net preview.',
      },
      history: {
        title: 'Order history',
        description: 'Key milestones, confirmations, and system updates across this deal.',
        refreshing: 'Refreshing history',
        emptyTitle: 'History is empty',
        emptyText: 'Order events will appear here as the deal progresses.',
      },
      fields: {
        game: 'Game',
        category: 'Category',
        myRole: 'Your role',
        counterpartyRole: 'Counterparty role',
        counterparty: 'Counterparty',
        orderedQuantity: 'Ordered',
        deliveredQuantity: 'Delivered',
        remainingQuantity: 'Remaining',
        completion: 'Completion',
        unitPrice: 'Unit price',
        totalAmount: 'Total',
        currency: 'Currency',
        createdAt: 'Created',
        updatedAt: 'Updated',
        expiresAt: 'Expires',
        gross: 'Gross',
        fee: 'Fee',
        net: 'Net',
        contexts: 'Context',
        attributes: 'Attributes',
        deliveryMethods: 'Delivery methods',
      },
    },
    roles: {
      buyer: 'Buyer',
      seller: 'Seller',
      system: 'System',
      unknown: 'Participant',
    },
    requestTypes: {
      cancel: 'Order cancellation',
      amend_quantity: 'Quantity change',
      unknown: 'Order request',
    },
    requestStatus: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      unknown: 'Unknown',
    },
    subtitles: {
      buyer: (username) => `You are buying from ${username}`,
      seller: (username) => `You are selling to ${username}`,
      generic: (username) => `Trade with ${username}`,
    },
    status: {
      pending: 'Pending',
      in_progress: 'In progress',
      partially_delivered: 'Partially delivered',
      delivered: 'Delivered',
      completed: 'Completed',
      canceled: 'Canceled',
      expired: 'Expired',
      unknown: 'Unknown',
    },
    statusDescriptions: {
      pending: 'The order is waiting for the first participant actions.',
      in_progress: 'The order is active and currently being processed.',
      partially_delivered: 'Delivery started but is not complete yet.',
      delivered: 'The lot was delivered, but the flow is not closed yet.',
      completed: 'The order was completed successfully.',
      canceled: 'The order was stopped and is no longer active.',
      expired: 'The order expired before completion.',
      unknown: 'The order state is still unclear.',
    },
  },
}

export function getOrderCopy(language = 'ru') {
  return ORDER_MESSAGES[language] || ORDER_MESSAGES.ru
}
