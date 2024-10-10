import { Button } from "@/components/ui/button"
import { LoaderCircle } from "lucide-react";
import * as React from "react";

export interface SpinningButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  spin: boolean;
}

const SpinningButton = React.forwardRef<React.ElementRef<typeof Button>, SpinningButtonProps>(
  ({ spin, children, ...props }, ref) => {
    return (
      <Button {...props}>
        {
          spin
            ?
            <LoaderCircle className="animate-spin w-4 h-4" />
            :
            <div>
              {children}
            </div>
        }
      </Button>
    )
  }
)

SpinningButton.displayName = "SpinningButton"

export { SpinningButton }
