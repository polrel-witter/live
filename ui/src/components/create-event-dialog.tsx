import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProfileForm from "./profile-form";
import { Backend, diffProfiles, Profile } from "@/backend";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  profile: Profile;
  onOpenChange: (b: boolean) => void;
  editProfileField: Backend["editProfileField"]
}

const CreateEventDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  profile,
  editProfileField
}) => {

  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    setOpenDialog(open)
  }, [open])


  const editProfile = async (fields: Record<string, string>): Promise<void> => {

    let fieldsToChange: [string, string | null][] = []

    fieldsToChange = diffProfiles(profile, fields)

    const _ = await Promise.all(fieldsToChange
      .map(([field, val]) => {
        return editProfileField(field, val)
      }))

    setOpenDialog(false)
    onOpenChange(false)

    return Promise.resolve()
  }

  return (
    <Dialog
      open={openDialog}
      onOpenChange={onOpenChange}
      aria-description="a dialog that creates a new event"
    >
      <DialogContent
        aria-description="contains event fields and a form to instantiate them"
      >
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <ProfileForm
            profileFields={profile}
            editProfile={editProfile}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export { CreateEventDialog };
