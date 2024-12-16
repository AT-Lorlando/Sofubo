import { Storage } from "@capacitor/storage";

export async function setApiKey(apiKey: string) {
  await Storage.set({
    key: "apiKey",
    value: apiKey,
  });
}

export async function getApiKey(): Promise<string | null> {
  const { value } = await Storage.get({ key: "apiKey" });
  return value;
}

export async function removeApiKey() {
  await Storage.remove({ key: "apiKey" });
}
