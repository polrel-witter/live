import { Profile } from "@/backend"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type Props = {
  profile: Profile
}

const MatchingCard: React.FC<Profile> = () => {
  return (
    <Card className="w-full h-full border-0 shadow-none">
      <CardHeader className="text-center"> userfoo </CardHeader>
      <CardContent className="text-center"> profile</CardContent>
    </Card>
  )
}

export { MatchingCard }
