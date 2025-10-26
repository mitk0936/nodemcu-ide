import React, { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type Props = {
  disabled?: boolean;
  openerLabel: ReactNode | string;
  confirmationLabel: string;
  onConfirm: () => void;
};

export function ConfirmActionButton({
  disabled = false,
  confirmationLabel,
  openerLabel,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          variant="destructive"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          {openerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuLabel>{confirmationLabel}</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          <Check className="w-4 h-4 mr-2" /> Yes, continue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen(false)}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
