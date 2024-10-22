import { Profile, } from '@/backend'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React from 'react'


export interface ProfileCardProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  profile: Profile,
  showHeader: boolean,
}


const ProfileCard = React.forwardRef<React.ElementRef<typeof Card>, ProfileCardProps>(
  ({ profile, showHeader, className, ...rest }, ref) => {
    return (
        <Card className={cn([
          "border-0 shadow-none",
          className
        ])} {...rest}>
          {
            showHeader
              ?
              <div className="font-semibold text-md">
                <div className="flex items-center justify-between">
                  <p> profile </p>
                  <div className="justify-self-end">

                  </div>
                </div>

              </div>
              :
              ""
          }
          {/* if this is not text-xs on mobile it goes off screen by 10px...*/}
          <div className="grid gap-2 text-xs md:text-sm">
            {
              Object.entries(profile).map(([field, val]) => {
                return (!val || field === "avatar"
                  ? ""
                  : <div className="text-justify" key={field}>{`${field}: ${val}`}</div>)
              })
            }
          </div>
        </Card>
    )
  })

export default ProfileCard;
