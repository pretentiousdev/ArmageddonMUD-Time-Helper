import { ref, Ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { DateTimeFormatOptions } from 'luxon';
import storage from '../services/Storage';

export interface localeSetting {
  day2Digits: boolean,
  weekdayFormat: string,
  monthFormat: string,
  hour12: boolean,
  displaySeconds: boolean,
  icDateMode: string,
}

export const useSettingsStore = defineStore('settings', () => {

  const themes = [
    {
      value: 'light',
      label: 'Light',
    },
    {
      value: 'classic',
      label: 'Classic',
    },
    // {
    //   value: 'dark',
    //   label: 'Dark',
    // }
  ];

  const theme = ref('light');
  const defaultContext = ref(1);

  async function loadSettings() {
    const kvs = await storage.kvLoadAll();
    kvs.forEach((kv) => {
      switch (kv.key) {
        case "theme":
          theme.value = kv.value;
          break;
        case "displayServerTime":
          displayServerTime.value = kv.value === "true";
          break;
        case "displayMoons":
          displayMoons.value = kv.value === "true";
          break;
        case "converterLocale":
          converterLocale.value = JSON.parse(kv.value);
          break;
        case "defaultContext":
          defaultContext.value = +kv.value
      }
    })
  }

  watch(theme, (newTheme, oldTheme) => {
    document.documentElement.classList.remove(oldTheme)
    document.documentElement.classList.add(newTheme)
    storage.kvStore("theme", newTheme);
  })

  watch(defaultContext, (context, oldContext) => {
    storage.kvStore("defaultContext", context.toString())
  })

  const displayMoons = ref(false);
  watch(displayMoons, (moons, oldMoons) => {
    const display = displayMoons.value ? "true" : "false"
    storage.kvStore("displayMoons", display)
  })

  const displayServerTime = ref(false);
  watch(displayServerTime, (newVal, oldVal) => {
    const display = displayServerTime.value ? "true" : "false";
    storage.kvStore("displayServerTime", display);
  })
  const converterLocale: Ref<localeSetting> = ref({
    day2Digits: false,
    weekdayFormat: "short",
    monthFormat: "long",
    hour12: true,
    displaySeconds: false,
    icDateMode: "normal",
  });

  watch(converterLocale, (newVal, oldVal) => {
    const s = JSON.stringify(newVal)
    storage.kvStore("converterLocale", s);
  }, { deep: true })

  const converterDate = ref(new Date())
  function setConverterDate(date: Date) {
    converterDate.value = date;
  }

  function locale() {
    let m: "short" | "long" | "numeric" | "2-digit" | "narrow" | undefined = undefined;
    switch (converterLocale.value.monthFormat) {
      case "short": case "long": case "numeric": case "2-digit": case "narrow":
        m = converterLocale.value.monthFormat;
    }

    let w: "short" | "long" | "narrow" | undefined = undefined;
    switch (converterLocale.value.weekdayFormat) {
      case "short": case "long": case "narrow":
        w = converterLocale.value.weekdayFormat;
    }
    let loc: DateTimeFormatOptions = {
      month: m,
      day: converterLocale.value.day2Digits ? "2-digit" : "numeric",
      year: "numeric",
      hour: converterLocale.value.hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: converterLocale.value.hour12,
      timeZoneName: "short",
      second: converterLocale.value.displaySeconds ? "2-digit" : undefined,
      weekday: w
    };
    return loc;
  }

  return { locale, displayServerTime, displayMoons, converterLocale, converterDate, setConverterDate, themes, theme, defaultContext, loadSettings }
});