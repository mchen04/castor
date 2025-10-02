'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface UserMenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  separator?: boolean
}

export interface UserMenuProps {
  menuItems: UserMenuItem[]
  position?: 'header' | 'dashboard'
  align?: 'start' | 'center' | 'end'
}

export function UserMenu({ menuItems, position = 'header', align = 'end' }: UserMenuProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleMenuItemClick = async (item: UserMenuItem) => {
    setIsLoading(true)
    try {
      await item.onClick()
    } catch (error) {
      console.error('Error executing menu action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const containerClasses = position === 'dashboard'
    ? 'fixed bottom-4 left-4 z-50'
    : ''

  const dropdownOffset = position === 'dashboard' ? { sideOffset: 8 } : {}

  return (
    <div className={containerClasses}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full ring-2 ring-gray-700/50 hover:ring-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-gray-800 text-gray-300">
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-56" {...dropdownOffset}>
          <DropdownMenuLabel>
            {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'My Account'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => handleMenuItemClick(item)}
                  disabled={isLoading}
                  className="cursor-pointer"
                  variant={item.variant}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
                {item.separator && <DropdownMenuSeparator />}
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
