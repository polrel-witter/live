import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type BackButtonProps = {
  pathToLinkTo: string
}

export const BackButton = ({ pathToLinkTo }: BackButtonProps) => {
  return (
    <Link to={pathToLinkTo}>
      <Button className="p-3 m-1 rounded-3xl">
        <ArrowLeft className="w-4 h-4 text-white" />
      </Button>
    </Link>
  )
}

