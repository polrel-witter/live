import { Patp, Profile } from "@/backend"

export function nickNameOrPatp(profile: Profile | undefined | null, patp: Patp) {
  return profile && profile.nickname !== ""
    ? profile.nickname ?? patp
    : patp
}
