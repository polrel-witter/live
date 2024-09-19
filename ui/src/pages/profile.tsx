import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom";

export async function PatpLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> { return { patp: params.params.patp! } }


export function ProfilePage() {
  const loaderData = useLoaderData() as { patp: string };
  const patp = loaderData!.patp || "~zod"

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am profile {patp} </div>
    </div>
  )
}
