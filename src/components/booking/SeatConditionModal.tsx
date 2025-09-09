import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EXIT_ROW_CONDITIONS } from "../../shared/constants/seatCopy";

interface SeatConditionModalProps {
  open: boolean;
  reason: string;
  onOpenChange: (open: boolean) => void;
}

const SeatConditionModal: React.FC<SeatConditionModalProps> = ({
  open,
  reason,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Không thể chọn ghế</DialogTitle>
        <DialogDescription className="space-y-2">
          <p>{reason}</p>
          <ul className="list-disc pl-5 space-y-1">
            {EXIT_ROW_CONDITIONS.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
          <a
            href="/terms#seat-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Xem điều kiện
          </a>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export default SeatConditionModal;
