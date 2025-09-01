import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

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
  <Card className="max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Boarding Pass</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <p>
        <strong>Hành khách:</strong> {passengerName}
      </p>
      <p>
        <strong>Chuyến bay:</strong> {flight}
      </p>
      <p>
        <strong>Ghế:</strong> {seat}
      </p>
    </CardContent>
  </Card>
);

export default BoardingPassCard;
