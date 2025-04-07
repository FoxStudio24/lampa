# 🌟 Плагины для приложения Lampa

Коллекция полезных плагинов для расширения функционала приложения **Lampa**.

---

## 📥 Установка

### 🔹 Способ 1: Через расширения в приложении **Lampa**

1. Откройте настройки расширений.
2. Добавьте новый плагин, указав ссылку.

**Пример:**
https://foxstudio24.github.io/lampa/TMDB_mod.js

> `TMDB_mod.js` — это название плагина.

---

### 🔹 Способ 2: Через файл `lampainit.js` в **LampaC**

Откройте файл `lampainit.js` и добавьте в него следующий код:

```js
Lampa.Utils.putScriptAsync(["https://foxstudio24.github.io/lampa/TMDB_mod.js"], function() {});
// Источник TMDB_mod

Lampa.Utils.putScriptAsync(["https://lampame.github.io/main/newcategory.js"], function() {});
// Новые категории, стриминги и другое

Lampa.Utils.putScriptAsync(["https://foxstudio24.github.io/lampa/cub_off.js"], function() {});
// Отключение рекламы от Куба

Lampa.Utils.putScriptAsync(["https://foxstudio24.github.io/lampa/buttons.js"], function() {});
// Иконки: онлайн, трейлеры и др. в карточках

Lampa.Utils.putScriptAsync(["https://foxstudio24.github.io/lampa/cardify.js"], function() {});
// Cardify — красивый интерфейс под ТВ и ПК

Lampa.Utils.putScriptAsync(["https://foxstudio24.github.io/lampa/logo.js"], function() {});
// Отображение логотипов вместо названий

