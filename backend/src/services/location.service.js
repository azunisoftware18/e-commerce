import { State, City } from "country-state-city";

// ✅ Get States
export const fetchStates = async () => {
  return State.getStatesOfCountry("IN");
};

// ✅ Get Cities
export const fetchCities = async (stateName) => {
  // State object find karo
  const state = State.getStatesOfCountry("IN").find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!state) {
    return [];
  }

  return City.getCitiesOfState("IN", state.isoCode);
};