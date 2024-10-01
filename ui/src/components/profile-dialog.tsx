import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProfileForm from "./profile-form";
import { Backend, EditableProfileFields } from "@/backend";

type Props = {
  open: boolean;
  patp: string;
  onOpenChange: (b: boolean) => void;
  profileFields: EditableProfileFields;
  editProfileField: Backend["editProfileField"]
}

const ProfileDialog: React.FC<Props> = ({ open, onOpenChange, profileFields, editProfileField }) => {

  // TODO: add disclaimer somewhere that explains how this info is shared

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
            <ProfileForm
              profileFields={profileFields}
              editProfileField={editProfileField}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>

  )
}

export default ProfileDialog;
