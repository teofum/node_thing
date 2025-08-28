import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

// defino tipo para DnDContext
type DndContextType = [string | null, Dispatch<SetStateAction<string | null>>];

const DnDContext = createContext<DndContextType | undefined>([null, (_) => {}]);

interface DndProviderProps {
  children: ReactNode;
}

export const DnDProvider = ({ children }: DndProviderProps) => {
  const state = useState<string | null>(null);

  return <DnDContext.Provider value={state}>{children}</DnDContext.Provider>;
};

export const useDnD = () => {
  const ctx = useContext(DnDContext);
  if (!ctx) {
    throw new Error("useDnD must be used inside a DnDProvider");
  }
  return ctx;
};
