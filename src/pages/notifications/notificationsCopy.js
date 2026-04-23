const NOTIFICATIONS_MESSAGES = {
  ru: {
    header: {
      buttonLabel: 'Уведомления',
      buttonAria: (count) =>
        count > 0 ? `Уведомления, ${count} непрочитанных` : 'Уведомления',
      panelTitle: 'Уведомления',
      panelSubtitle: 'Последние события по ордерам и финансам',
      loadingTitle: 'Загружаем уведомления',
      loadingText: 'Подтягиваем последние события и состояние прочтения.',
      emptyTitle: 'Пока пусто',
      emptyText: 'Новые события по ордерам, депозитам и выводам появятся здесь.',
      errorTitle: 'Не удалось загрузить уведомления',
      loadError: 'Не удалось загрузить уведомления.',
      retry: 'Повторить',
      markAll: 'Отметить всё прочитанным',
      allNotifications: 'Все уведомления',
    },
    page: {
      eyebrow: 'Notification center',
      title: 'Уведомления',
      subtitle:
        'Следите за сообщениями по ордерам, изменениями статусов и событиями по финансам в одном месте.',
      filtersLabel: 'Показать',
      filters: {
        all: 'Все',
        unread: 'Непрочитанные',
        read: 'Прочитанные',
      },
      loadingTitle: 'Загружаем уведомления',
      loadingText: 'Подтягиваем ленту и состояние прочтения.',
      errorTitle: 'Не удалось загрузить уведомления',
      loadError: 'Не удалось загрузить уведомления.',
      retry: 'Повторить',
      listTitle: 'Лента уведомлений',
      listSubtitle: 'Открывайте нужные события и возвращайтесь в связанные разделы.',
      markAll: 'Отметить всё прочитанным',
      markRead: 'Отметить прочитанным',
      open: 'Открыть',
      unread: 'Новое',
      read: 'Прочитано',
      actionError: 'Не удалось обновить уведомление.',
      previousPage: 'Назад',
      nextPage: 'Дальше',
      pageLabel: 'Страница',
      of: 'из',
      empty: {
        all: {
          title: 'Уведомлений пока нет',
          text: 'Когда появятся события по ордерам, депозитам или выводам, они будут здесь.',
        },
        unread: {
          title: 'Непрочитанных уведомлений нет',
          text: 'Сейчас все новые события уже просмотрены.',
        },
        read: {
          title: 'Прочитанных уведомлений пока нет',
          text: 'Как только вы начнёте открывать уведомления, они появятся в этом разделе.',
        },
      },
    },
    common: {
      untitled: 'Уведомление',
      emptyBody: 'Подробности уведомления недоступны.',
      notAvailable: '—',
      unreadCount: (count) =>
        count > 0 ? `${count} непрочитанных` : 'Нет новых уведомлений',
    },
  },
  en: {
    header: {
      buttonLabel: 'Notifications',
      buttonAria: (count) =>
        count > 0 ? `Notifications, ${count} unread` : 'Notifications',
      panelTitle: 'Notifications',
      panelSubtitle: 'Latest order and finance updates',
      loadingTitle: 'Loading notifications',
      loadingText: 'Fetching the latest events and read state.',
      emptyTitle: 'Nothing here yet',
      emptyText: 'New order, deposit, and withdrawal events will appear here.',
      errorTitle: 'Failed to load notifications',
      loadError: 'Failed to load notifications.',
      retry: 'Retry',
      markAll: 'Mark all as read',
      allNotifications: 'All notifications',
    },
    page: {
      eyebrow: 'Notification center',
      title: 'Notifications',
      subtitle:
        'Track order messages, status changes, and finance events in one place.',
      filtersLabel: 'Show',
      filters: {
        all: 'All',
        unread: 'Unread',
        read: 'Read',
      },
      loadingTitle: 'Loading notifications',
      loadingText: 'Fetching the feed and read state.',
      errorTitle: 'Failed to load notifications',
      loadError: 'Failed to load notifications.',
      retry: 'Retry',
      listTitle: 'Notification feed',
      listSubtitle: 'Open relevant events and jump back to the connected section.',
      markAll: 'Mark all as read',
      markRead: 'Mark as read',
      open: 'Open',
      unread: 'New',
      read: 'Read',
      actionError: 'Failed to update the notification.',
      previousPage: 'Previous',
      nextPage: 'Next',
      pageLabel: 'Page',
      of: 'of',
      empty: {
        all: {
          title: 'No notifications yet',
          text: 'Order, deposit, and withdrawal events will appear here.',
        },
        unread: {
          title: 'No unread notifications',
          text: 'Everything new has already been reviewed.',
        },
        read: {
          title: 'No read notifications yet',
          text: 'Notifications will appear here once you start opening them.',
        },
      },
    },
    common: {
      untitled: 'Notification',
      emptyBody: 'Notification details are unavailable.',
      notAvailable: '—',
      unreadCount: (count) => (count > 0 ? `${count} unread` : 'No new notifications'),
    },
  },
}

export function getNotificationsCopy(language = 'ru') {
  return NOTIFICATIONS_MESSAGES[language] || NOTIFICATIONS_MESSAGES.ru
}
