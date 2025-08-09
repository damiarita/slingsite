'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const Redirecter = ({ redirecting, path}: {redirecting: string, path: string}) => {
  const router = useRouter()
  useEffect(() => {
    router.replace(path)
  }, [router, path])
  
  return <div>{redirecting}...</div>
}