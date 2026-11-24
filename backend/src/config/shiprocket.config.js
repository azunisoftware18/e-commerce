export const shiprocketConfig = {
  baseURL: process.env.SHIPROCKET_BASE_URL,
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,

  pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION,

  // Package dimensions in cm and weight in kg
  length: Number(process.env.SHIPROCKET_LENGTH),
  breadth: Number(process.env.SHIPROCKET_BREADTH),
  height: Number(process.env.SHIPROCKET_HEIGHT),
  weight: Number(process.env.SHIPROCKET_WEIGHT),
};
