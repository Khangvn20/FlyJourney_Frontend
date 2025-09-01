import React from "react";

interface BoardingPassCardProps {
  passengerName: string;
  flight: string;
  seat: string;
}

const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  passengerName,
  flight,
  seat,
}) => (
  <div className="max-w-md mx-auto border rounded p-4 bg-white shadow">
    <h2 className="text-xl font-semibold mb-4">Boarding Pass</h2>
    <p>
      <strong>Hành khách:</strong> {passengerName}
    </p>
    <p>
      <strong>Chuyến bay:</strong> {flight}
    </p>
    <p>
      <strong>Ghế:</strong> {seat}
    </p>
  </div>
);

export default BoardingPassCard;
