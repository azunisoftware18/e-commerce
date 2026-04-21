"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setAuthChecked } from "@/store/slices/authSlice";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      dispatch(setUser(JSON.parse(user)));
    }

    // ✅ YE LINE MOST IMPORTANT HAI
    dispatch(setAuthChecked());

  }, [dispatch]);

  return children;
}