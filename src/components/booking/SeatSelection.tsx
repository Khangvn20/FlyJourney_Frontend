import React, { useState } from "react";
import SimpleSeatMap from "./SimpleSeatMap";
import SeatLegend from "./SeatLegend";
import { Button } from "../ui/button";

interface SeatSelectionProps {
  onComplete: (seatId: string) => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (seatId: string) => {
    setSelected([seatId]);
  };

  return (
    <div className="space-y-4">
      <SeatLegend />
      <SimpleSeatMap selectedSeats={selected} onSeatSelect={handleSelect} />
      <Button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onComplete(selected[0])}
        className="bg-blue-600 text-white"
      >
        Xác nhận ghế
      </Button>
    </div>
  );
};

export default SeatSelection;
