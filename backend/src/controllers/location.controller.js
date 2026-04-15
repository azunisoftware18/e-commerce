import { fetchCities, fetchStates } from "../services/location.service.js";

// ✅ helper: clean text
const cleanText = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ✅ States Controller
export const getStates = async (req, res) => {
  try {
    const states = await fetchStates();

    res.json({
      success: true,
      data: states.map((s) => cleanText(s.name)), // 🔥 clean names
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Cities Controller
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

    // 🔥 clean + sort
    const cleanedCities = cities
      .map(cleanText)
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