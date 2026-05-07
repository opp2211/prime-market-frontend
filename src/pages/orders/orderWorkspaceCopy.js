const ORDER_WORKSPACE_COPY = {
  ru: {
    actionsBodyTitle: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f',
    actionsBodyText:
      '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u0448\u0430\u0433\u0438 \u0434\u043b\u044f \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0442\u0430\u0434\u0438\u0438 \u0441\u0434\u0435\u043b\u043a\u0438.',
    details: {
      commercial: '\u0420\u0430\u0441\u0447\u0435\u0442\u044b',
      item: '\u041b\u043e\u0442 \u0438 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430',
      parties: '\u0421\u0442\u043e\u0440\u043e\u043d\u044b \u0438 \u0441\u0440\u043e\u043a\u0438',
      texts: '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0438 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
    },
    tabs: {
      chat: '\u0427\u0430\u0442',
      details: '\u0414\u0435\u0442\u0430\u043b\u0438',
      history: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f',
      support: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
    },
    tabsAria: '\u0420\u0430\u0431\u043e\u0447\u0438\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u0441\u0434\u0435\u043b\u043a\u0438',
  },
  en: {
    actionsBodyTitle: 'Actions',
    actionsBodyText: 'Available steps for the current deal stage.',
    details: {
      commercial: 'Commercials',
      item: 'Item and handoff',
      parties: 'Parties and dates',
      texts: 'Terms and description',
    },
    tabs: {
      chat: 'Chat',
      details: 'Details',
      history: 'History',
      support: 'Support',
    },
    tabsAria: 'Order workspace tabs',
  },
}

export function getOrderWorkspaceCopy(language = 'ru') {
  return ORDER_WORKSPACE_COPY[language] || ORDER_WORKSPACE_COPY.ru
}
