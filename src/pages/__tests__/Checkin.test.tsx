import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Checkin from "../Checkin";

describe("Checkin Page", () => {
  it("renders form and progresses to seat selection", async () => {
    const { getByLabelText, getByText } = render(<Checkin />);
    fireEvent.change(getByLabelText("Mã đặt chỗ"), { target: { value: "ABC123" } });
    fireEvent.change(getByLabelText("Họ"), { target: { value: "Nguyen" } });
    fireEvent.click(getByText("Tìm chuyến bay"));
    await waitFor(() =>
      expect(getByText(/Chọn ghế cho chuyến bay/)).toBeInTheDocument(),
    );
  });
});
