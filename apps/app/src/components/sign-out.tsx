'use client'

import { createClient } from '@seeds/supabase/client'
import { Button } from '@seeds/ui/button'
import { Icons } from '@seeds/ui/icons'

export function SignOut() {
  const supabase = createClient()

  const handleSignOut = () => {
    supabase.auth.signOut()
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="primary"
      className="font-mono gap-2 flex items-center"
      rightSlot={<Icons.SignOut className="size-4" />}
    >
      <span>Sign out</span>
    </Button>
  )
}
