import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface CheckinFormProps {
  onSubmit: (bookingCode: string, lastName: string) => void;
}

const CheckinForm: React.FC<CheckinFormProps> = ({ onSubmit }) => {
  const [bookingCode, setBookingCode] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(bookingCode, lastName);
      }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Check-in Online</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="bookingCode" className="block text-sm font-medium mb-1">
              Mã đặt chỗ
            </label>
            <Input
              id="bookingCode"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Họ
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Tìm chuyến bay
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CheckinForm;
