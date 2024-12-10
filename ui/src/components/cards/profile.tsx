import React from 'react'

import { Profile } from "@/lib/types"
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ProfileCardProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  profile: Profile,
  showHeader: boolean,
}

const ProfileCard = React.forwardRef<React.ElementRef<typeof Card>, ProfileCardProps>(
  ({ profile, showHeader, className, ...rest }, ref) => {
    const fields = [
      "bio",
      "x",
      "ensDomain",
      "email",
      "github",
      "telegram",
      "signal",
      "phone",
    ]
    const fieldsToRender = Object.entries(profile)
      .filter(([, value])  => value !== null && value !== "")
      .filter(([field, _]) => fields.includes(field))

    return (
      <Card className={cn([
        "border-0 shadow-none",
        className
      ])} {...rest}>
        {
          showHeader
            ?
            <div className="font-semibold text-md">
              <div className="mb-2 flex items-center justify-between">
                <p> profile </p>
              </div>

            </div>
            :
            ""
        }
        {/* if this is not text-xs on mobile it goes off screen by 10px...*/}
        <div className="grid gap-2 text-xs md:text-sm">
          {
            fieldsToRender.length !== 0
              ? fieldsToRender
                .map(([field, val]) =>
                  <div className="text-justify" key={field}>
                    {`${field}: ${val}`}
                  </div>
                )
              : <div className="text-justify font-light">
                no profile fields to display...
              </div>
          }
        </div>
      </Card>
    )
  })

export { ProfileCard };
