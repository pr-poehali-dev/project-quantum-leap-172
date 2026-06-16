import type { Product } from "@/types"

export const SERVER_IP = "mcfire.box"
export const SERVER_VERSION = "1.20.4"

export const products: Product[] = [
  {
    id: "vip",
    name: "VIP",
    description: "Цветной ник, /kit vip, доступ к /hat и приоритет входа на сервер.",
    price: 149,
    icon: "Star",
    color: "#4ade80",
  },
  {
    id: "premium",
    name: "PREMIUM",
    description: "Всё из VIP + /fly в спавне, доступ к /workbench и набор ресурсов.",
    price: 299,
    icon: "Crown",
    color: "#34d399",
    badge: "Хит",
  },
  {
    id: "elite",
    name: "ELITE",
    description: "Привилегии PREMIUM + личный варп, /feel, /heal и 2 кейса в подарок.",
    price: 499,
    icon: "Gem",
    color: "#10b981",
  },
  {
    id: "deluxe",
    name: "DELUXE",
    description: "Расширенные команды, цветной чат, /enderchest и питомцы.",
    price: 799,
    icon: "Sparkles",
    color: "#06b6d4",
  },
  {
    id: "legend",
    name: "LEGEND",
    description: "Эксклюзивный префикс, доступ к ивент-зонам и приватные регионы x3.",
    price: 1290,
    icon: "Award",
    color: "#a78bfa",
    badge: "Топ",
  },
  {
    id: "dragon",
    name: "DRAGON",
    description: "Максимальный статус: все привилегии, кастомный плащ и крылья дракона.",
    price: 1990,
    icon: "Flame",
    color: "#f97316",
    badge: "MAX",
  },
  {
    id: "coins",
    name: "Внутриигровая валюта",
    description: "Пакет 10 000 изумрудов для покупок на сервере и в аукционе.",
    price: 199,
    icon: "Coins",
    color: "#facc15",
  },
  {
    id: "cases",
    name: "Кейсы",
    description: "Набор из 5 кейсов с шансом выпадения редких предметов и ресурсов.",
    price: 249,
    icon: "Box",
    color: "#fb7185",
  },
  {
    id: "resources",
    name: "Наборы ресурсов",
    description: "Стартовый набор: алмазы, броня, инструменты и еда на старте игры.",
    price: 179,
    icon: "Package",
    color: "#60a5fa",
  },
]

export interface Rule {
  num: number
  text: string
  punishment: string
}

export const rules: Rule[] = [
  { num: 1, text: "Запрещены оскорбления игроков.", punishment: "Кик или мут." },
  { num: 2, text: "Запрещён читинг.", punishment: "Бан от 30 дней." },
  { num: 3, text: "Запрещено использование багов.", punishment: "Бан от 7 дней." },
  { num: 4, text: "Запрещён гриферский контент.", punishment: "Блокировка аккаунта." },
  { num: 5, text: "Запрещён флуд.", punishment: "Мут." },
  { num: 6, text: "Запрещена реклама сторонних проектов.", punishment: "Перманентный бан." },
  { num: 7, text: "Запрещены угрозы.", punishment: "Мут или бан." },
  { num: 8, text: "Запрещены запрещённые ники.", punishment: "Смена ника." },
  { num: 9, text: "Запрещено выдавать себя за администрацию.", punishment: "Бан." },
  { num: 10, text: "Запрещено распространение вредоносных ссылок.", punishment: "Перманентный бан." },
  { num: 11, text: "Запрещён обход наказаний.", punishment: "Увеличение срока бана." },
  { num: 12, text: "Запрещена продажа аккаунтов.", punishment: "Блокировка аккаунта." },
  { num: 13, text: "Запрещены провокации конфликтов.", punishment: "Мут." },
  { num: 14, text: "Запрещено использование нескольких аккаунтов для обхода правил.", punishment: "Бан всех аккаунтов." },
  { num: 15, text: "Неуважение к администрации запрещено.", punishment: "Мут или бан." },
]