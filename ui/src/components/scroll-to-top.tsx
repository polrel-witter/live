import { PropsWithChildren, useEffect } from "react";
import { useLocation } from "react-router";

const ScrollToTop: React.FC<PropsWithChildren<{}>> = (props) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export { ScrollToTop };

