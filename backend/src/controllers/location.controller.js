import { fetchCities, fetchStates } from "../services/location.service.js";
import axios from "axios";


const cleanText = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const getStates = async (req, res) => {
  try {
    const states = await fetchStates();

    const cleanedStates = states
      .map((state) => cleanText(state.name))
      .sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      data: cleanedStates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCities = async (req, res) => {
  try {
    const { state } = req.params;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "State is required",
      });
    }

    const cities = await fetchCities(state);

    const cleanedCities = cities
      .map((city) => cleanText(city.name))
      .sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      data: cleanedCities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLocationByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode",
      });
    }

    const { data } = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    if (
      data[0].Status !== "Success" ||
      !data[0].PostOffice?.length
    ) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found",
      });
    }

    const office = data[0].PostOffice[0];

    return res.json({
      success: true,
      data: {
        state: office.State,
        city: office.District,
        area: office.Name,
      },
    });
  } catch (error) {
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
}
};