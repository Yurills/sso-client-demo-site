
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, Shield } from "lucide-react";

interface AccountSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localUser: any;
  ssoUser: any;
  onSelectLocal: () => void;
  onSelectSSO: () => void;
}

const AccountSelectionDialog = ({
  open,
  onOpenChange,
  localUser,
  ssoUser,
  onSelectLocal,
  onSelectSSO
}: AccountSelectionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Multiple Accounts Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have accounts from both SSO and this website. Which account would you like to continue with?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 my-4">
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">SSO Account</span>
            </div>
            <div className="text-sm text-blue-800">
              <div>Name: {ssoUser?.name || 'N/A'}</div>
              <div>Email: {ssoUser?.email || 'N/A'}</div>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Local Account</span>
            </div>
            <div className="text-sm text-gray-700">
              <div>Name: {localUser?.name || 'N/A'}</div>
              <div>Email: {localUser?.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction 
            onClick={onSelectSSO}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue with SSO
          </AlertDialogAction>
          <AlertDialogCancel 
            onClick={onSelectLocal}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Continue with Local
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AccountSelectionDialog;
