import React, { ComponentPropsWithRef, PropsWithChildren, ReactNode, useEffect, useMemo, useState, useSyncExternalStore } from "react"

// https://sandroroth.com/blog/react-slots/#slots-with-context-api

type Props = {
  top: ReactNode
  bottom: ReactNode
} & PropsWithChildren

const AppFrame: React.FC<Props> = ({ top, bottom, children }) => {

  return (
    <div>
      {top}
      {children}
      {bottom}
    </div >
  )
}

export { AppFrame }
