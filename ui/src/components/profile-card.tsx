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
      <div className="flex justify-center">
        <Card className={cn([
          "mt-4 border-0 shadow-none",
          className
        ])} {...rest}>
          {
            showHeader
              ?
              <CardHeader className="p-4 font-semibold text-md">
                <div className="flex items-center justify-between">
                  <p> profile </p>
                  <div className="justify-self-end">

                  </div>
                </div>

              </CardHeader>
              :
              ""
          }
          {/* if this is not text-xs on mobile it goes off screen by 10px...*/}
          <CardContent className="p-4 pt-0 grid gap-2 text-xs md:text-sm">
            {
              Object.entries(profile).map(([field, val]) => {
                return (!val || field === "avatar"
                  ? ""
                  : <div className="text-justify" key={field}>{`${field}: ${val}`}</div>)
              })
            }
          </CardContent>
        </Card>
      </div>
    )
  })

export default ProfileCard;
