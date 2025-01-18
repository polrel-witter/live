import { Profile } from "@/lib/types"
import { Patp } from "@/lib/types"

export function nickNameOrPatp(profile: Profile | undefined | null, patp: Patp) {
  return profile && profile.nickname !== ""
    ? profile.nickname ?? patp
    : patp
}
