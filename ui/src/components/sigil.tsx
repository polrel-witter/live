import { sigil as UrbitSigil, Config } from "@urbit/sigil-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Props = React.CustomComponentPropsWithRef<typeof Avatar> & {
  sigilConfig: Config
  avatarUrl?: string
}

const Sigil: React.FC<Props> = ({
  sigilConfig: { point: patp, ...rest },
  avatarUrl,
  ...restProps
}) => {

  const isMoon = patp.length > 14
  const isComet = patp.length > 28

  // fallback uses moon & comet emojis
  const fallBack = <AvatarFallback className={`text-2xl bg-stone-200 h-full w-full`}>{isMoon ? "🌑" : "☄️"}</AvatarFallback>
  const sigil = <UrbitSigil {...{ point: patp, ...rest }} />
  const avatarOrSigil = (avatarUrl ? <AvatarImage src={avatarUrl} /> : sigil)

  return (
    <Avatar {...restProps}>
      {(isMoon || isComet) ? fallBack : avatarOrSigil}
    </Avatar>
  )
}

export default Sigil;
