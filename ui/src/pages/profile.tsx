import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom";
import { Backend, Profile } from "@/backend";
import { useState } from "react";

export async function PatpLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> { return { patp: params.params.patp! } }


export function ProfilePage(props: { backend: Backend }) {
  const loaderData = useLoaderData() as { patp: string };
  const patp = loaderData!.patp || "~zod"

  const [profile, setProfile] = useState<Profile | null>(null)

  // uncommenting this line makes browser eat 100% cpu???
  // props.backend.getProfile(patp).then(setProfile)

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am profile {patp}, here are my deets:</div>
      <div className="text-bold">{profile ? JSON.stringify(profile) : "no profile"} </div>
    </div>
  )
}
