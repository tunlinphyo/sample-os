# 🧠 Sample OS — Browser-Based Simulated Operating System

A frontend-only operating system simulation using Web Components, TypeScript, and a custom reactive store system. This project mimics OS-level concepts like apps, state stores, and system notifications in the browser — with no frameworks.

---

## 🚀 Live Website

[🔗 View the site](https://paper-os.web.app/)

---

## 🚀 Features

- 🪟 Modular app structure (`counter`, `books`, `songs`, `alarm`)
- 🧠 Reactive stores (e.g., `noti.store.ts`, `books.store.ts`) without Redux or external libs
- ⏰ Notification, alarm, and state handling inspired by real OSes
- 🧼 Simple yet scalable styling via `style.css`
- 📁 Organized TypeScript and stores logic per domain

---

## 🧠 Architecture & Concepts

- `main.ts` initializes and boots the "OS" by mounting apps and UI containers.
- Stores like `noti.store.ts` manage their own reactive state using custom signal logic.
- Applications (e.g. `counter`) use these stores like services.
- CSS is kept lean, focused on layout and basic theming.

---

## 🧠 Tech Stack

| Area        | Tools/Technologies                     |
|-------------|----------------------------------------|
| Language    | TypeScript                             |
| UI Layer    | Web Components, HTML, CSS              |
| State Mgmt  | Custom signal-based stores             |
| Build Tool  | Vite                                   |
| Styling     | Vanilla CSS, modular theme structure   |
| Hosting     | Firebase static hosting                |

---

## 📦 Setup & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🙋‍♂️ About the Author

**Tun Lin Phyo**
Frontend engineer and system-level UI builder. Based in Tokyo 🇯🇵.
Specializes in performance-first, framework-free web applications.

- 🌐 [Portfolio](https://tunlinphyo.com)
- 💻 Uses Web Components, custom stores, and Vite.

---

## 📝 License

MIT License
