import type { Role } from './api'

export const ROLE_META: Record<Role, { label: string; color: string; icon: string; badge: string }> = {
  player:    { label: 'Игрок',     color: '#9ca3af', icon: 'User',        badge: '' },
  helper:    { label: 'Helper',    color: '#34d399', icon: 'LifeBuoy',    badge: '🌱' },
  moderator: { label: 'Moderator', color: '#60a5fa', icon: 'Shield',     badge: '🛡' },
  admin:     { label: 'Admin',     color: '#f97316', icon: 'ShieldCheck', badge: '⚡' },
  creator:   { label: 'Создатель', color: '#fbbf24', icon: 'Crown',       badge: '★' },
}

// Лимиты выдачи наказаний по ролям (часы). null = без ограничений, 0 = запрещено.
export const BAN_LIMIT: Record<Role, number | null> = {
  player: 0, helper: 0, moderator: 30 * 24, admin: null, creator: null,
}
export const MUTE_LIMIT: Record<Role, number | null> = {
  player: 0, helper: 12, moderator: 40, admin: 72, creator: null,
}

export const isStaff = (role?: Role) =>
  role === 'helper' || role === 'moderator' || role === 'admin' || role === 'creator'

export const canBan = (role?: Role) => !!role && BAN_LIMIT[role] !== 0
export const canMute = (role?: Role) => !!role && MUTE_LIMIT[role] !== 0
export const canRemovePunishment = (role?: Role) =>
  role === 'moderator' || role === 'admin' || role === 'creator'
export const canReviewComplaints = (role?: Role) =>
  role === 'moderator' || role === 'admin' || role === 'creator'
export const canManageStaff = (role?: Role) => role === 'admin' || role === 'creator'
export const isCreator = (role?: Role) => role === 'creator'

export function formatLimit(hours: number | null): string {
  if (hours === null) return 'без ограничений'
  if (hours === 0) return 'запрещено'
  if (hours % 24 === 0) return `${hours / 24} дн.`
  return `${hours} ч.`
}

// Описание прав для окна «Мои права»
export const ROLE_RIGHTS: Record<Role, { title: string; allowed: string[]; denied: string[] }> = {
  player: {
    title: 'Игрок',
    allowed: ['Просмотр наказаний', 'Подача жалоб и обжалований'],
    denied: ['Выдача наказаний', 'Доступ к панели персонала'],
  },
  helper: {
    title: 'Хелпер',
    allowed: [
      'Выдача мутов (макс. 12 ч)',
      'Подача отчётов о нарушениях',
      'Просмотр наказаний, выданных им самим',
    ],
    denied: ['Выдача банов', 'Снятие наказаний', 'Управление персоналом'],
  },
  moderator: {
    title: 'Модератор',
    allowed: [
      'Выдача банов (макс. 30 дней)',
      'Выдача мутов (макс. 40 ч)',
      'Подача жалоб на игроков',
      'Просмотр наказаний модераторов',
      'Снятие своих наказаний',
      'Обжалование решений администрации',
    ],
    denied: ['Перманентные баны', 'Управление персоналом'],
  },
  admin: {
    title: 'Администратор',
    allowed: [
      'Выдача банов/мутов без ограничений',
      'Просмотр и редактирование всех наказаний',
      'Рассмотрение обжалований и жалоб',
      'Управление модераторами и хелперами',
      'Снятие любых наказаний',
    ],
    denied: ['Изменение настроек сайта (только Создатель)'],
  },
  creator: {
    title: 'Создатель',
    allowed: [
      'Все права администратора',
      'Полная настройка сайта',
      'Выдача любых ролей',
      'Управление товарами и привилегиями',
    ],
    denied: [],
  },
}
