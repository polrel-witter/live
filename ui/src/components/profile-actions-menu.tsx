import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button";

import { SpinningButton } from "./spinning-button";
import { useEffect, useState } from "react";

import { Ellipsis, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { MatchStatus } from "@/backend";

type Props = {
  patp: string,
  status: MatchStatus,
  unmatch: (patp: string) => void
}

const ProfileActionsMenu: React.FC<Props> = ({ patp, status, unmatch }) => {

  const [spin, setSpin] = useState(false)

  useEffect(() => {
    if (!spin) { return }

    setSpin(false)

  }, [status])
  return (
    <DropdownMenu>
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
  )
}

export { ProfileActionsMenu }
