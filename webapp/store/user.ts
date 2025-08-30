import { create } from "zustand";

export type UserProfile = {
  name: string;
  birthDate?: string; // ISO yyyy-mm-dd
  birthTime?: string; // HH:mm
  sunSign?: string;   // "Virgo"
  moonSign?: string;
  ascendant?: string;
  element?: string;   // "Earth"
  planet?: string;    // "Mercury"
  polarity?: string;  // "Feminine"
  modality?: string;  // "Mutable"
  avatarUrl?: string;
};

type UserState = {
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
};

export const useUser = create<UserState>((set) => ({
  profile: {
    name: "Antin",
    birthDate: "2000-09-01",
    birthTime: "12:00",
    sunSign: "Virgo",
    moonSign: "Libra",
    ascendant: "Scorpio",
    element: "Earth",
    planet: "Mercury",
    polarity: "Feminine",
    modality: "Mutable",
  },
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
}));













