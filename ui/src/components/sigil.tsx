import "@urbit/sigil-js"
import { Config, sigil as sigilFn } from "@urbit/sigil-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isComet, isMoon } from "@/lib/utils"
import { useEffect, useRef } from "react"

type Props = React.CustomComponentPropsWithRef<typeof Avatar> & {
  point: string;
  avatarUrl?: string
  size: "xs"
}

const Sigil: React.FC<Props> = ({
  point,
  avatarUrl,
  size,
  ...restProps
}) => {

  const moon = isMoon(point)
  const comet = isComet(point)

  const makeSigilCfg = (point: string): Config => {
    return {
      point: point,
      size: size === "xs" ? 18 : 50,
      space: size === "xs" ? "default" : "default",
      background: '#000000',
      foreground: '#ffffff',
      detail: size === "xs" ? "none" : "default",
    }
  }

  // fallback uses moon & comet emojis
  const fallBack = <AvatarFallback className={`text-2xl bg-stone-200 h-full w-full`}>{moon ? "🌑" : "☄️"}</AvatarFallback>
  // if no luck do this https://stackoverflow.com/a/64174075
  const sigilSvg = sigilFn(sigilcfg)

  const svgWrapperRef = useRef<{ className: string, innerHTML: null | string }>({ className: "relative left-3", innerHTML: null });
  useEffect(() => {
    svgWrapperRef.current.innerHTML = sigilSvg;
  }, [])

  // @ts-ignore
  // const sigil = <urbit-sigil className="p-1 rounded-full" {...sigilcfg} />
  const sigil = <div className="bg-black rounded-full p-1" ref={svgWrapperRef}> </div>

  return (
    (avatarUrl
      ?
      <Avatar {...restProps}>
        <AvatarImage src={avatarUrl} />
      </Avatar>
      :
      ((moon || comet)
        ? fallBack
        :
        // className="mx-2 w-5 h-5 md:w-7 md:h-7 object-contain "
        // className="bg-black p-1 self-center fit-content rounded-full">
        sigil
      )
    )
  )
}

export default Sigil;
