import { sigil as UrbitSigil, Config } from "@urbit/sigil-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isComet, isMoon } from "@/lib/utils"

type Props = React.CustomComponentPropsWithRef<typeof Avatar> & {
  sigilConfig: Config
  avatarUrl?: string
}

const Sigil: React.FC<Props> = ({
  sigilConfig: { point: patp, ...rest },
  avatarUrl,
  ...restProps
}) => {

  const moon = isMoon(patp)
  const comet = isComet(patp)

  // fallback uses moon & comet emojis
  const fallBack = <AvatarFallback className={`text-2xl bg-stone-200 h-full w-full`}>{moon ? "🌑" : "☄️"}</AvatarFallback>
  const sigil = <UrbitSigil {...{ point: patp, ...rest }} />
  const avatarOrSigil = (avatarUrl ? <AvatarImage src={avatarUrl} /> : sigil)

  return (
    <Avatar {...restProps}>
      {(moon || comet) ? fallBack : avatarOrSigil}
    </Avatar>
  )
}

export default Sigil;
