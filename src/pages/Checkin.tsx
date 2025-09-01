import React, { useState } from "react";
import { CheckinForm, BoardingPassCard } from "../components/checkin";
import SeatSelection from "../components/booking/SeatSelection";
import {
  lookupBooking,
  submitCheckin,
  type CheckinBooking,
} from "../services/checkinService";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const Checkin: React.FC = () => {
  const [booking, setBooking] = useState<CheckinBooking | null>(null);
  const [seat, setSeat] = useState<string>("");
  const [done, setDone] = useState(false);

  const handleLookup = async (code: string, lastName: string) => {
    const data = await lookupBooking(code, lastName);
    setBooking(data);
    if (data.seat) setSeat(data.seat);
  };

  const handleSeatConfirm = async (seatId: string) => {
    if (!booking) return;
    setSeat(seatId);
    await submitCheckin(booking.bookingCode, seatId);
    setDone(true);
  };

  if (!booking) {
    return <CheckinForm onSubmit={handleLookup} />;
  }

  if (done) {
    return (
      <BoardingPassCard
        passengerName={booking.passengerName}
        flight={booking.flightId}
        seat={seat}
      />
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Chọn ghế cho chuyến bay {booking.flightId}</CardTitle>
      </CardHeader>
      <CardContent>
        <SeatSelection onComplete={handleSeatConfirm} />
      </CardContent>
    </Card>
  );
};

export default Checkin;
