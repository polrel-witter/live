import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProfileForm from "./profile-form";
import { Backend, Profile } from "@/backend";

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  profileFields: Profile;
  editProfile: (fields: Record<string, string>) => Promise<void>
}

const ProfileDialog: React.FC<Props> = ({ open, onOpenChange, profileFields, editProfile }) => {

  // TODO: add disclaimer somewhere that explains how this info is shared

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-description="a dialog containing a form to edit profile"
    >
      <DialogContent
        aria-description="Contains profile fields and a form to update them"
      >
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <ProfileForm
            profileFields={profileFields}
            editProfile={editProfile}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileDialog;
