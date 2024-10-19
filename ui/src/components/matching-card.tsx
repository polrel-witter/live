import { Profile } from "@/backend"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type Props = {
  profile: Profile
}

const MatchingCard: React.FC<Props> = ({ profile }) => {
  return (
    <Card className="flex-row">
      <div className="text-center"> userfoo </div>
      <div className="text-center"> {profile.patp}</div>
    </Card>
  )
}

export { MatchingCard }
