import { create } from "zustand";
import { Dataset, FilterState, DateRange } from "../domain/types";
import { generateDataset, SimulatorConfig } from "../domain/generator";
import { filterDataset, resolveDateRange } from "../domain/metrics";
import { useSettingsStore } from "./settingsStore";

interface DataState {
  dataset: Dataset;
  version: number;
  regenerate: (config?: SimulatorConfig) => void;
  reset: () => void;
  getFilteredData: (filter: FilterState) => {
    current: Dataset;
    previous: Dataset;
    currentRange: DateRange;
    previousRange: DateRange;
  };
}

export const useDataStore = create<DataState>((set, get) => ({
  dataset: generateDataset(useSettingsStore.getState().simulator),
  version: 1,

  regenerate: (config) => {
    const cfg = config || useSettingsStore.getState().simulator;
    const nextDataset = generateDataset(cfg);
    set((state) => ({
      dataset: nextDataset,
      version: state.version + 1
    }));
  },

  reset: () => {
    useSettingsStore.getState().resetSection("simulator");
    const nextDataset = generateDataset(useSettingsStore.getState().simulator);
    set((state) => ({
      dataset: nextDataset,
      version: state.version + 1
    }));
  },

  getFilteredData: (filter: FilterState) => {
    const { dataset } = get();
    const ranges = resolveDateRange(filter);
    const current = filterDataset(dataset, filter, ranges.current);
    const previous = filterDataset(dataset, filter, ranges.previous);

    return {
      current,
      previous,
      currentRange: ranges.current,
      previousRange: ranges.previous
    };
  }
}));
