import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { cx } from "~/utils/styles.ts";
import { useStore } from "@nanostores/react";
import { localeStore, serverStore } from "~/pages/[locale]/_store.ts";
import type { Locale } from "~/i18n/languages.ts";
import SettingsIcon from "~/components/icons/SettingsIcon.tsx";
import { useTranslations } from "~/i18n/utils.ts";

interface Props {
  languages: Record<
    Locale,
    {
      url: string;
      label: string;
    }
  >;
  currentLanguage: Locale;
}
const Settings: React.FC<Props> = ({ languages, currentLanguage }) => {
  const $server = useStore(serverStore);
  const locale = useStore(localeStore);
  const t = useTranslations(locale);

  return <>
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="inline-flex text-neutral-50 bg-neutral-600 items-center justify-center py-2 px-3 font-medium leading-none outline-none outline-offset-1 hover:bg-neutral-500 focus-visible:outline-2 focus-visible:outline-neutral-200 select-none gap-2 rounded-3xl">
          <SettingsIcon></SettingsIcon> {t("nav.settings.label")}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/40 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-neutral-800 border border-neutral-600 p-4 shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="sr-only">
            {t("nav.settings.label")}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {t("nav.settings.description")}
          </Dialog.Description>
          <div className="flex w-full flex-col gap-4 rounded-lg text-neutral-100">
            <div>
              <p>{t("nav.settings.server")}</p>
              <div className="mt-2 flex justify-center rounded border border-neutral-600">
                {["Global", "CN"].map((server) => {
                  const selected = $server === server;
                  return (
                    <button
                      key={server}
                      onClick={() => serverStore.set(server as "Global" | "CN")}
                      className={cx(
                        "flex h-8 w-full items-center justify-center rounded py-2 hover:bg-neutral-700",
                        {
                          "bg-neutral-500 hover:bg-neutral-400 text-neutral-50":
                          selected,
                        }
                      )}
                    >
                      {server === "Global" ? t("nav.settings.global") : t("nav.settings.cn")}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p>{t("nav.settings.language")}</p>
              <div className="mt-2 flex justify-center rounded border border-neutral-600">
                {Object.entries(languages).map(([localePath, language]) => {
                  const selected = localePath === currentLanguage;
                  return (
                    <a
                      key={localePath}
                      href={language.url}
                      className={cx(
                        "flex h-8 w-full items-center justify-center rounded py-2 hover:bg-neutral-700",
                        {
                          "bg-neutral-500 hover:bg-neutral-400 text-neutral-50":
                          selected,
                        }
                      )}
                    >
                      {language.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
};

export default Settings;