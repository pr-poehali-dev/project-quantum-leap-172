import type { ReactNode } from "react"

export interface Section {
  id: string
  title: string
  subtitle?: ReactNode
  content?: string
  showButton?: boolean
  buttonText?: string
}

export interface SectionProps extends Section {
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  icon: string
  color: string
  badge?: string
}

export interface CartItem extends Product {
  qty: number
}
