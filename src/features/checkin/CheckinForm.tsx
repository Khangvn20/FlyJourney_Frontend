import React, { useState } from "react";

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
      className="space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-center">Check-in Online</h2>
      <div>
        <label htmlFor="bookingCode" className="block text-sm font-medium mb-1">
          Mã đặt chỗ
        </label>
        <input
          id="bookingCode"
          type="text"
          value={bookingCode}
          onChange={(e) => setBookingCode(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
          Họ
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Tìm chuyến bay
      </button>
    </form>
  );
};

export default CheckinForm;
