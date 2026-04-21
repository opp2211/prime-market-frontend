const USER_AREA_MESSAGES = {
  ru: {
    sections: {
      trading: {
        title: '\u0422\u043e\u0440\u0433\u043e\u0432\u043b\u044f',
        subtitle:
          '\u041e\u0444\u0444\u0435\u0440\u044b, \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u0440\u0430\u0431\u043e\u0447\u0438\u0439 \u043a\u043e\u043d\u0442\u0443\u0440 \u0431\u0438\u0440\u0436\u0438',
      },
      money: {
        title: '\u0414\u0435\u043d\u044c\u0433\u0438',
        subtitle:
          '\u041a\u043e\u0448\u0435\u043b\u0435\u043a, \u043f\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u0438 \u0432\u044b\u0432\u043e\u0434\u044b',
      },
      account: {
        title: '\u0410\u043a\u043a\u0430\u0443\u043d\u0442',
        subtitle:
          '\u041f\u0440\u043e\u0444\u0438\u043b\u044c, \u0434\u043e\u0441\u0442\u0443\u043f \u0438 \u0438\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438',
      },
    },
    nav: {
      dashboard: 'Dashboard',
      analytics: '\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430',
      depositRequests:
        '\u0417\u0430\u044f\u0432\u043a\u0438 \u043d\u0430 \u043f\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435',
      withdrawalRequests:
        '\u0417\u0430\u044f\u0432\u043a\u0438 \u043d\u0430 \u0432\u044b\u0432\u043e\u0434',
      email: 'Email',
      password: '\u041f\u0430\u0440\u043e\u043b\u044c',
      integrations: '\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438',
      comingSoon: '\u0421\u043a\u043e\u0440\u043e',
    },
    dashboard: {
      eyebrow: '\u0422\u043e\u0440\u0433\u043e\u0432\u0430\u044f \u043f\u0430\u043d\u0435\u043b\u044c',
      title: 'Dashboard',
      subtitle:
        '\u0415\u0434\u0438\u043d\u0430\u044f \u0442\u043e\u0447\u043a\u0430 \u0432\u0445\u043e\u0434\u0430 \u0432 \u043b\u0438\u0447\u043d\u044b\u0439 \u0442\u043e\u0440\u0433\u043e\u0432\u044b\u0439 \u043a\u043e\u043d\u0442\u0443\u0440: \u043e\u0444\u0444\u0435\u0440\u044b, \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u0431\u0443\u0434\u0443\u0449\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430.',
      offersTitle: '\u041c\u043e\u0438 \u043e\u0444\u0444\u0435\u0440\u044b',
      offersText:
        '\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u043b\u0438\u0441\u0442\u0438\u043d\u0433\u0430\u043c\u0438 \u0438 \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c\u0438 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438.',
      ordersTitle: '\u041c\u043e\u0438 \u0441\u0434\u0435\u043b\u043a\u0438',
      ordersText:
        '\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044b \u0438 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0439\u0442\u0435 workspace \u0441\u0434\u0435\u043b\u043a\u0438.',
      analyticsTitle: '\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430',
      analyticsText:
        '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u0438 performance \u0437\u0430\u0439\u043c\u0443\u0442 \u043c\u0435\u0441\u0442\u043e \u0432 \u044d\u0442\u043e\u0439 \u0436\u0435 \u0441\u0435\u043a\u0446\u0438\u0438.',
      open: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c',
    },
    placeholders: {
      withdrawalRequests: {
        title:
          '\u0417\u0430\u044f\u0432\u043a\u0438 \u043d\u0430 \u0432\u044b\u0432\u043e\u0434',
        description:
          '\u0420\u0430\u0437\u0434\u0435\u043b \u0437\u0430\u043b\u043e\u0436\u0435\u043d \u0432 \u0434\u0435\u043d\u0435\u0436\u043d\u0443\u044e \u0437\u043e\u043d\u0443. UI \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u044f\u0432\u043b\u0435\u043d\u0438\u044f backend-\u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u0430.',
      },
      accountEmail: {
        title: 'Email',
        description:
          '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 email \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0432 \u0441\u0435\u043a\u0446\u0438\u0438 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430.',
      },
      accountPassword: {
        title: '\u041f\u0430\u0440\u043e\u043b\u044c',
        description:
          '\u0421\u043c\u0435\u043d\u0430 \u043f\u0430\u0440\u043e\u043b\u044f \u0431\u0443\u0434\u0435\u0442 \u0436\u0438\u0442\u044c \u0437\u0434\u0435\u0441\u044c, \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u043e\u0442 \u0434\u0435\u043d\u0435\u0433 \u0438 \u0441\u0434\u0435\u043b\u043e\u043a.',
      },
      accountIntegrations: {
        title: '\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438',
        description:
          'Discord \u0438 \u0434\u0440\u0443\u0433\u0438\u0435 \u0441\u0432\u044f\u0437\u043a\u0438 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0432 \u044d\u0442\u043e\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u0435.',
      },
    },
  },
  en: {
    sections: {
      trading: {
        title: 'Trading',
        subtitle: 'Offers, deals, and the exchange workspace',
      },
      money: {
        title: 'Money',
        subtitle: 'Wallet, deposits, and withdrawals',
      },
      account: {
        title: 'Account',
        subtitle: 'Profile, access, and integrations',
      },
    },
    nav: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      depositRequests: 'Deposit requests',
      withdrawalRequests: 'Withdrawal requests',
      email: 'Email',
      password: 'Password',
      integrations: 'Integrations',
      comingSoon: 'Soon',
    },
    dashboard: {
      eyebrow: 'Trading dashboard',
      title: 'Dashboard',
      subtitle:
        'A single entry point for your private trading area: offers, deals, and future analytics.',
      offersTitle: 'My offers',
      offersText: 'Manage listings and trade terms.',
      ordersTitle: 'My orders',
      ordersText: 'Track statuses and open the deal workspace.',
      analyticsTitle: 'Analytics',
      analyticsText: 'Performance and statistics will live in this section.',
      open: 'Open',
    },
    placeholders: {
      withdrawalRequests: {
        title: 'Withdrawal requests',
        description:
          'This money section is reserved for withdrawals. The UI can connect when the backend contract exists.',
      },
      accountEmail: {
        title: 'Email',
        description: 'Email settings belong in the account section.',
      },
      accountPassword: {
        title: 'Password',
        description:
          'Password management belongs here, separate from money and trading.',
      },
      accountIntegrations: {
        title: 'Integrations',
        description:
          'Discord and other account integrations will live in this section.',
      },
    },
  },
}

export function getUserAreaCopy(language = 'ru') {
  return USER_AREA_MESSAGES[language] || USER_AREA_MESSAGES.ru
}
