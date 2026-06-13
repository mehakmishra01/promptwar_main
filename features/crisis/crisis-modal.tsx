"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HELPLINES, CRISIS_DISCLAIMER } from "@/features/crisis/helplines";
import { Phone } from "lucide-react";

interface CrisisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Crisis support modal with verified Indian helplines. */
export function CrisisModal({ open, onOpenChange }: CrisisModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You matter — help is available</DialogTitle>
          <DialogDescription>{CRISIS_DISCLAIMER}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-4" role="list" aria-label="Crisis helplines">
          {HELPLINES.map((helpline) => (
            <li key={helpline.name} className="rounded-lg border border-border p-4">
              <p className="font-semibold">{helpline.name}</p>
              <p className="text-sm text-muted-foreground">{helpline.description}</p>
              <p className="text-xs text-muted-foreground">{helpline.hours}</p>
              <Button asChild className="mt-2" variant="outline">
                <a href={`tel:${helpline.number}`} aria-label={`Call ${helpline.name} at ${helpline.number}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {helpline.number}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
