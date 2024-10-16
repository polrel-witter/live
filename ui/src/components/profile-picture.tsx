import "@urbit/sigil-js"
import { Config, sigil as sigilFn } from "@urbit/sigil-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, isComet, isMoon } from "@/lib/utils"
import { useEffect, useRef } from "react"

type Size = "xs" | "sm"

type SizeParams = {
  size: Config["size"],
  space: Config["space"],
  detail: Config["detail"]
  wh: string;
}

type SigilProps = {
  point: string;
  sizeParams: SizeParams;
}

const getSizeParams = (size: Size): SizeParams => {
  switch (size) {
    case "xs":
      return {
        size: 18,
        space: "default",
        detail: "none",
        wh: "w-7 h-7"
      }
    case "sm":
      return {
        size: 28,
        space: "default",
        detail: "default",
        wh: "w-10 h-10"
      }
  }
}

const Sigil: React.FC<SigilProps> = ({ point, sizeParams }) => {

  const sigilcfg: Config = {
    point: point,
    size: sizeParams.size,
    space: sizeParams.space,
    background: '#000000',
    foreground: '#ffffff',
    detail: sizeParams.detail,
  }

  const sigilSvg = sigilFn(sigilcfg)

  const svgWrapperRef = useRef<{ innerHTML: null | string }>({ innerHTML: null });

  useEffect(() => {
    svgWrapperRef.current.innerHTML = sigilSvg;
  }, [])

  // @ts-ignore
  // const sigil = <urbit-sigil className="p-1 rounded-full" {...sigilcfg} />
  // className="mx-2   "
  // className="bg-black p-1 self-center fit-content rounded-full">
  const sigil = <div ref={svgWrapperRef}
    className="bg-black rounded-full w-full h-full flex justify-center items-center" />

  return sigil
}

type Props = React.CustomComponentPropsWithRef<typeof Avatar> & {
  point: string;
  avatarUrl?: string
  size: Size
}

const ProfilePicture: React.FC<Props> = ({
  point,
  avatarUrl,
  size,
  ...restProps
}) => {


  const moon = isMoon(point)
  const comet = isComet(point)

  // if no luck do this https://stackoverflow.com/a/64174075

  const sp = getSizeParams(size)

  return (

    <Avatar className={cn([sp.wh])} {...restProps}>
      {(avatarUrl
        ? <AvatarImage src={avatarUrl} />
        : ((moon || comet)
          ? <AvatarFallback className="text-2xl bg-gray-300" > {moon ? "🌑" : "☄️"} </AvatarFallback>
          : <Sigil point={point} sizeParams={sp} />)
      )}
    </Avatar>
  )
}

export default ProfilePicture;
