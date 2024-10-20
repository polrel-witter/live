import { Profile, } from '@/backend'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import React from 'react'


export interface ProfileCardProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  profile: Profile,
  showHeader: boolean,
}


const ProfileCard = React.forwardRef<React.ElementRef<typeof Card>, ProfileCardProps>(
  ({ profile, showHeader, ...rest }, ref) => {
    return (
      <Card className="mt-4 border-0 shadow-none" {...rest}>
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
                : <div key={field}>{`${field}: ${val}`}</div>)
            })
          }
        </CardContent>
      </Card>
    )
  })

export default ProfileCard;
