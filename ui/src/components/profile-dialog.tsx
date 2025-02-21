import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProfileForm from "@/components/forms/profile";
import { diffProfiles, Profile } from "@/lib/types";
import { useEffect, useState } from "react";
import { Backend } from "@/lib/backend";

type Props = {
  open: boolean;
  profile: Profile;
  onOpenChange: (b: boolean) => void;
  editProfileField: Backend["editProfileField"]
  setAddPals: Backend["setAddPals"]
}

const ProfileDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  profile,
  editProfileField,
  setAddPals
}) => {

  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    setOpenDialog(open)
  }, [open])

  const editProfile = async (fields: Record<string, string>, addPals: boolean): Promise<void> => {

    let fieldsToChange: [string, string | null][] = []

    fieldsToChange = diffProfiles(profile, fields)

    await Promise.all(fieldsToChange
      .map(([field, val]) => {
        return editProfileField(field, val)
      }))

    await setAddPals(addPals)

    setOpenDialog(false)
    onOpenChange(false)

    return Promise.resolve()
  }

  return (
    <Dialog
      open={openDialog}
      onOpenChange={onOpenChange}
      aria-description="a dialog containing a form to edit profile"
    >
      <DialogContent
        aria-description="Contains profile fields and a form to update them"
      >
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
        </DialogHeader>
        <ProfileForm
          profileFields={profile}
          editProfile={editProfile}
        />
      </DialogContent>
    </Dialog>
  )
}

export { ProfileDialog };
