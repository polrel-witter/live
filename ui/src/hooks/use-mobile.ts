import { useEffect, useMemo, useState } from "react";

export function useOnMobile() {
  const [width, setWidth] = useState<number>(window.innerWidth);

  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const onMobile = useMemo(() => { return width <= 768 }, [width]);

  return onMobile
}
