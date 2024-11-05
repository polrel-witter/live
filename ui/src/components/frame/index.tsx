import { is } from "date-fns/locale"
import React, { ComponentPropsWithRef, PropsWithChildren, ReactNode, useEffect, useMemo, useState, useSyncExternalStore } from "react"

// https://sandroroth.com/blog/react-slots/#slots-with-context-api

const NavBar: React.FC<PropsWithChildren> = ({ children }) => {
  return (children)
}


const Footer: React.FC<PropsWithChildren> = ({ children }) => {
  return (children)
}

// TODO: refactor to accept parts as props
const AppFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [width, setWidth] = useState<number>(window.innerWidth);


  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = useMemo(() => { return width <= 768 }, [width]);

  const [SlottedNavBar, SetSlottedNavBar] = useState<null | React.ReactNode>(null)
  const [SlottedFooter, SetSlottedFooter] = useState<null | React.ReactNode>(null)

  const [rest, setRest] = useState<React.ReactNode[]>([]);

  useEffect(
    () => {
      const content: React.ReactNode[] = []
      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === NavBar) {
          console.log("header")
          SetSlottedNavBar(child);
        } else if (child.type === Footer) {
          console.log("footer")
          SetSlottedFooter(child);
        } else {
          content.push(child);
        }
        setRest(content)
        return () => {
          setRest([])
          SetSlottedFooter(null)
          SetSlottedNavBar(null)
        }
      });
    }, [children, isMobile])

  // this code is not reactive!!!

  return (
    <div>
      <div> hello this is a div {isMobile ? "true" : "false"}</div>
      {
        isMobile
          ?
          <div>
            {SlottedFooter}
            {rest}
            {SlottedNavBar}
          </div >
          :
          <div>
            {SlottedNavBar}
            {rest}
            {SlottedFooter}
          </div>
      }
    </div>
  )
}

export { AppFrame, NavBar, Footer }
