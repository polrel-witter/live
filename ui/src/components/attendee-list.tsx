import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Profile, Session } from "@/backend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Handshake, Users, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"

function makeConnectionsCard() {
  return (
    <Card className="w-24 border rounded p-0.5">
      {/*
      * possile states:
      * - matched: we show "matched" on green bg, or green check on green bg that says "matched" on hover 
      * - we sent match request: we show "proposed match" on light blue bg,
      *   or light blue check on green bg that says "asked match" on hover;
      *   we also add red cross icon to annull match
      * - we did nothing: we show blank bg with match icon or "ask to match" text
      */}
      <CardHeader className="text-xs space-0 p-0.5 text-center"> connections </CardHeader>
      <CardContent className="p-0.5">
        <div className="flex justify-around">
          <span className="h-4 w-4 bg-red-600"> </span>
          <span className="h-4 w-4 bg-red-600"> </span>
        </div>
      </CardContent>
    </Card>
  )
}

function makeAttendeeMarkup(profile: Profile) {
  const [b, setB] = useState(false)
  return (
    <li key={profile.patp}>
      <Card >
        <CardContent
          className={
            "px-6 py-3 content-center"}>
          <div className="flex gap-4 gap-x-10 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm">{profile.patp}</p>
              <Button className="h-4 w-4 p-0 border rounded-2xl bg-transparent">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
            <Button onClick={() => setB((prev) => !prev)} className="w-10 h-10 p-0 border rounded-full bg-transparent">
              <Users className="h-4 w-4 text-gray-400" />
              {/* <Handshake className="h-4 w-4 opacity-50"/> */}
              {/* <span className="text-2xl opacity-50">🤝</span> */}
            </Button>
          </div>
          <div
            className={"overflow-hidden transition-[max-height] duration-500 ease-in-out "
              + (b ? "max-h-[300px]" : "max-h-0")}
          >
            {makeConnectionsCard()}
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

export default function AttendeeList(props: { profiles: Profile[] }) {
  return (
    <ul className="grid gap-6">
      {props.profiles ? props.profiles.map(makeAttendeeMarkup) : []}
    </ul>
  )
}

