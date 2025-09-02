
'use client'

import { useEffect, useState } from 'react'
import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg, UseTranslationOptions } from 'react-i18next'
import { useCookies } from 'react-cookie'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions, cookieName } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => import(`../../../public/locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag'], // Only detect from URL path and HTML tag
    },
    preload: runsOnServerSide ? getOptions().supportedLngs : []
  })

export function useTranslation(lng: string, ns?: string | string[], options?: UseTranslationOptions) {
  const [cookies, setCookie] = useCookies([cookieName])
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret

  // Set language on server side
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng)
  }

  // Handle language change on client side
  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return
    i18n.changeLanguage(lng)
  }, [lng, i18n])

  // Update cookie on language change
  useEffect(() => {
    if (cookies.i18next === lng) return
    setCookie(cookieName, lng, { path: '/' })
  }, [lng, cookies.i18next, setCookie])
  
  return ret
}
