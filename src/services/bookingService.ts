export const bookingService = async (_details: Record<string, unknown>) => {
  console.log("Mock booking with:", _details);
  return { status: "success", bookingId: "XYZ987" };
};
