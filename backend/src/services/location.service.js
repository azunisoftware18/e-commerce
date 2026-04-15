import axios from "axios";

const BASE_URL = "https://countriesnow.space/api/v0.1/countries";

// ✅ Get States
export const fetchStates = async () => {
  const res = await axios.post(`${BASE_URL}/states`, {
    country: "India",
  });

  return res.data.data.states;
};

// ✅ Get Cities
export const fetchCities = async (state) => {
  const res = await axios.post(
    `${BASE_URL}/state/cities`,
    {
      country: "India",
      state,
    }
  );

  return res.data.data;
};