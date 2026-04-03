"use client";

import { useEffect, useState } from "react";

const profileOverridesKey = "campusswap.demo.profile-overrides";
const profileOverridesEvent = "campusswap:profile-overrides";

interface ProfileOverride {
  avatar?: string;
}

type ProfileOverrideMap = Record<string, ProfileOverride>;

function readOverrides(): ProfileOverrideMap {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(profileOverridesKey);
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ProfileOverrideMap;
  } catch {
    return {};
  }
}

function writeOverrides(value: ProfileOverrideMap) {
  window.localStorage.setItem(profileOverridesKey, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(profileOverridesEvent));
}

export function getAvatarOverride(userId: string) {
  return readOverrides()[userId]?.avatar;
}

export async function saveAvatarOverride(userId: string, file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Avatar upload failed."));
    reader.readAsDataURL(file);
  });

  const overrides = readOverrides();
  overrides[userId] = {
    ...overrides[userId],
    avatar: dataUrl
  };
  writeOverrides(overrides);
  return dataUrl;
}

export function clearAvatarOverride(userId: string) {
  const overrides = readOverrides();
  if (!overrides[userId]) {
    return;
  }

  const nextOverride = { ...overrides[userId] };
  delete nextOverride.avatar;

  if (Object.keys(nextOverride).length === 0) {
    delete overrides[userId];
  } else {
    overrides[userId] = nextOverride;
  }

  writeOverrides(overrides);
}

export function useAvatarOverride(userId: string, initialAvatar?: string) {
  const [avatar, setAvatar] = useState<string | undefined>(initialAvatar);

  useEffect(() => {
    const sync = () => {
      setAvatar(getAvatarOverride(userId) ?? initialAvatar);
    };

    sync();
    window.addEventListener(profileOverridesEvent, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(profileOverridesEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [initialAvatar, userId]);

  return avatar;
}
