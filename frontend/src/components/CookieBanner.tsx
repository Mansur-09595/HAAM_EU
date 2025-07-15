"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const COOKIE_NAME = "cookie_consent"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // one year

function hasConsent() {
  return document.cookie.split("; ").some((row) => row.startsWith(`${COOKIE_NAME}=`))
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    document.cookie = `${COOKIE_NAME}=true; path=/; max-age=${COOKIE_MAX_AGE}`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 text-center">
      <p className="mb-2 text-sm">Мы используем файлы cookie для улучшения работы сайта.</p>
      <Button onClick={accept}>Принять</Button>
    </div>
  )
}