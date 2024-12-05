import { Patp, Profile } from "@/lib/backend"

export function nickNameOrPatp(profile: Profile | undefined | null, patp: Patp) {
  return profile && profile.nickname !== ""
    ? profile.nickname ?? patp
    : patp
}
