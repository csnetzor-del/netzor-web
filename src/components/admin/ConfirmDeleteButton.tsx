"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  label?: string;
  confirmMessage: string;
};

export function ConfirmDeleteButton({
  action,
  userId,
  label = "Remove",
  confirmMessage,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="danger" size="sm">
        {label}
      </Button>
    </form>
  );
}
