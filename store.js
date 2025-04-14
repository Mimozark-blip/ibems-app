// store.js
import { create } from "zustand";

export const useStore = create((set) => ({
  currentSensor: null,
  sensorData: { alertMessage: "No Activity", intensityLevel: "0" },
  availableSensors: [],
  sensorIndex: 0,

  // To check if Sensor is Online
  xAxisData: [],
  yAxisData: [],
  zAxisData: [],
  setXAxisData: (data) => set(() => ({ xAxisData: data })),
  setYAxisData: (data) => set(() => ({ yAxisData: data })),
  setZAxisData: (data) => set(() => ({ zAxisData: data })),

  // Function to update current sensor
  setCurrentSensor: (sensor) => set({ currentSensor: sensor }),

  // Function to update sensor data
  setSensorData: (data) => set({ sensorData: data }),

  // Function to update available sensors
  setAvailableSensors: (sensors) => set({ availableSensors: sensors }),

  // Function to swap to the next sensor
  handleSwap: () =>
    set((state) => {
      const nextIndex = (state.sensorIndex + 1) % state.availableSensors.length;
      return {
        sensorIndex: nextIndex,
        currentSensor: state.availableSensors[nextIndex],
      };
    }),
}));
