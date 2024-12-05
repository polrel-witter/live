import { Profile } from "@/lib/backend"
import { ProfileDialog } from "@/components/profile-dialog"
import { SlideDownAndReveal } from "@/components/sliders"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn, flipBoolean } from "@/lib/utils"
import { ChevronUp, User } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

type MobileMenuProps = {
  links: Array<{
    to: string,
    text: string,
    disabled?: boolean,
  }>
}

export const MobileMenu = ({ links }: MobileMenuProps) => {
  const [openMenu, setOpenMenu] = useState(false)

  type LinkType = MobileMenuProps["links"][number]

  const liItem = (link: LinkType) => {

    if (link.disabled) {
      return (<Button disabled > {link.text} </Button>)
    }

    const className = cn(
      [
        buttonVariants({ variant: "default" }),
        "w-full",
        "bg-gray-600"
      ]
    )

    return (
      <Link
        to={link.to}
        onClick={function() { setOpenMenu(false) }}
        className={className}>
        {link.text}
      </Link>
    )
  }

  return (
    <div className="fixed bottom-28 right-2">
      <SlideDownAndReveal
        show={openMenu}
        maxHeight="max-h-[1000px]"
        duration="duration-1000"
      >
        <ul className="grid gap-3 m-6">
          {links.map((link) =>
            <li key={link.to}>
              {liItem(link)}
            </li>
          )}
        </ul>
      </SlideDownAndReveal>
      <Button
        className="p-2 w-10 h-10 m-6 rounded-full fixed right-0 bottom-12 hover:bg-gray-600"
        onClick={() => { setOpenMenu(flipBoolean) }}
      >
        <ChevronUp className={
          cn([
            "w-5 h-5 text-accent transition duration-700",
            { "-rotate-180": openMenu },
          ])
        } />
      </Button>
    </div>
  )
}

type ProfileButtonProps = {
  profile: Profile,
  editProfileField: (field: string, value: string | null) => Promise<void>
  setAddPals: (b:boolean) => Promise<void>
}

export const ProfileButton = ({ profile, ...fns }: ProfileButtonProps) => {
  const [openProfile, setOpenProfile] = useState(false)

  return (
    <div>
      <Button
        onClick={() => { setOpenProfile(flipBoolean) }}
        className="p-3 m-1 rounded-3xl">
        <User
          className="w-4 h-4 text-white"
        />
      </Button>
      <ProfileDialog
        onOpenChange={setOpenProfile}
        open={openProfile}
        profile={profile}
        editProfileField={fns.editProfileField}
        setAddPals={fns.setAddPals}
      />
    </div>
  )
}
