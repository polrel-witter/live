import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Backend, MatchStatus, Profile, } from '@/backend'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import { Ellipsis, MessageCircle } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"
import { useEffect, useState } from "react"
import { SpinningButton } from "./spinning-button"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

type Props = {
  patp: string,
  status: MatchStatus,
  profile: Profile,
  showHeader: boolean,
  unmatch: (patp: string) => void
}

const ProfileCard: React.FC<Props> = ({ patp, status, profile, showHeader, unmatch }) => {

  const [spin, setSpin] = useState(false)

  useEffect(() => {
    if (!spin) { return }

    setSpin(false)

  }, [status])


  return (
    <Card className="mt-4">
      {
        showHeader
          ?
          <CardHeader className="p-4 font-semibold text-md">
            <div className="flex items-center justify-between">
              <p> profile </p>
              <div className="justify-self-end">
                <DropdownMenu >
                  {/* maybe  make this into a button tap area too small */}
                  <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} >
                    <Ellipsis className="w-4 h-4 text-black" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="font-normal">
                      <Link
                        to={`/apps/groups/dm/~${patp}`}
                        reloadDocument
                      >
                        <div className="flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 mr-2 mb-[3px] text-black" />
                          send DM in tlon
                        </div>
                      </Link>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel> match status: {status}</DropdownMenuLabel>
                    <div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <SpinningButton
                          spin={spin}
                          className="w-full h-6 text-black"
                          disabled={status === "unmatched"}
                          variant={status === "unmatched" ? "ghost" : "destructive"}
                          onClick={status === "unmatched" ? (_) => { } : (_) => { setSpin(false); unmatch(patp) }}

                        >
                          unmatch
                        </SpinningButton>
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
                case "nickname":
                  return null;
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
