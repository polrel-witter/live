import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Backend, MatchStatus, Profile, } from '@/backend'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import { Ellipsis } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"

type Props = {
  patp: string,
  status: MatchStatus,
  profile: Profile,
  showHeader: boolean,
  unmatch: (patp:string) => void
}

const ProfileCard: React.FC<Props> = ({ patp, status, profile, showHeader, unmatch}) => {
  return (
    <Card className="mt-4">
      {
        showHeader
          ?
          <CardHeader className="p-4 font-semibold text-md">
            <div className="flex items-center justify-between">
              <p> profile overview </p>
              <div className="justify-self-end">
                <DropdownMenu >
                  {/* maybe  make this into a button tap area too small */}
                  <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} >
                    <Ellipsis className="w-4 h-4 text-black" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel> match status: {status}</DropdownMenuLabel>
                    <div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem    >
                        <Button
                          className="w-full h-6 text-black"
                          disabled={status === "unmatched"}
                          variant={status === "unmatched" ? "ghost" : "destructive"}
                          onClick={status === "unmatched" ? (_) => {}: (_) => {unmatch(patp)}}

                        >
                          unmatch
                        </Button>
                      </DropdownMenuItem>
                    </div>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

          </CardHeader>
          :
          ""
      }
      <CardContent className="p-4 pt-0 text-sm">
        {
          Object.entries(profile).map(([field, val]) => {
            switch (field) {
              case "avatar":
              case "bio":
              case "nickname":
                const fieldVal = (val ? val : "not set in tlon")
                return (
                  <div key={field}>
                    <span>{field}: </span>
                    <span className={val ? "" : "font-bold"}>{fieldVal}</span>
                  </div>
                )
              default:
                return (val ? <p key={field}>{`${field}: ${val}`}</p> : "")
            }
          })
        }
      </CardContent>
    </Card>
  )
}

export default ProfileCard;
