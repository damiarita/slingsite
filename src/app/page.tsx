import { Redirecter } from '@/components/redirecter'
import {getDictionary} from '@/i18n/lib'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('en');
  return {
    title: dict.redirecting,
  }
}

export default async function HomePage() {
  const dict = await getDictionary('en');
  return (
    <html>
      <body>
        <Redirecter pageType='image' redirecting={dict.redirecting} />
      </body>
    </html>
  )
}