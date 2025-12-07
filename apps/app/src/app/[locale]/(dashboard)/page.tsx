import { Container } from '@/components/container'
import { getI18n } from '@/locales/server'
import { getUser } from '@seeds/supabase/queries'

export const metadata = {
  title: 'Home',
}

export default async function Page() {
  const { data } = await getUser()
  const t = await getI18n()

  return (
    <Container>
      <div>
        hi
        {/* <p>{t("welcome", { name: data?.user?.email })}</p> */}
        {/* <SignOut /> */}
      </div>
    </Container>
  )
}
