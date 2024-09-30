import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom";
import { Backend, Profile } from "@/backend";
import { useEffect, useState } from "react";
import ProfileForm from "@/components/profile-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export async function PatpLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> { return { patp: params.params.patp! } }


export function ProfilePage(props: { backend: Backend }) {
  const loaderData = useLoaderData() as { patp: string };
  const patp = loaderData!.patp || "~zod"

  const [profile, setProfile] = useState<Profile | null>(null)

  // this needs to have an empty dependency array otherwise cpu blows up
  useEffect(() => {
    props.backend.getProfile(patp).then(setProfile)
  }, [])

  return (
    <Card className="m-4">
      <CardHeader className="text-center">Your Profile</CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <ProfileForm
            profileFields={profile!.editableFields}
            editProfileField={props.backend.editProfileField}
          />
        </div>
      </CardContent>
    </Card>
  )
}
