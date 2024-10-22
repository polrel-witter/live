import { useContext, useEffect } from "react";
import { EventContext } from "./context";

export function MapPage() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }


  const tmp = "https://images.rawpixel.com/image_1300/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA5L3BkbWlzY3Byb2plY3QyMC1kaWdpdGFsY3djb21tb253ZWFsdGhjajgya3o0OGctaW1hZ2UuanBn.jpg"

  const imgUrl = (
    ctx.event.details.venueMap !== ""
      ?
      ctx.event.details.venueMap
      :
      tmp
  )

  useEffect(() => {

    document.querySelector('meta[name="viewport"]')!
      .setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=1");

    return () => {
      document.querySelector('meta[name="viewport"]')!
        .setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");

    }
  }, [])



  return (
    <div className="max-w-2lg grid space-y-6 py-20 justify-center">
      <h1 className="text-center text-2xl mb-4"> Venue Map </h1>
      <img src={imgUrl} />
    </div>
  )
}
