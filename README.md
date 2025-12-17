# 🐾 Macau Pet Eats

A modern, mobile-friendly web application to discover and share pet-friendly restaurants in Macau.

![Project Banner](https://images.unsplash.com/photo-1544568100-847a948585b9?w=1200&q=80)

## ✨ Features

- **🔎 Explore:** Discover pet-friendly restaurants with detailed info on pet policies (patio only, indoors, etc.).
- **🌐 Multilingual:** Full support for English, Traditional Chinese (中文), and Portuguese (Português).
- **📝 Reviews:** Users can leave ratings, comments, and upload photos of their experience.
- **📸 Gallery:** Browse photos of restaurants, food, and furry friends.
- **✍️ Community Submissions:** Users can submit new pet-friendly spots for review.
- **🛡️ Admin Panel:** Dedicated dashboard for administrators to manage restaurants, review submissions, and moderate content.
- **📱 Responsive Design:** Optimized for both desktop and mobile devices with a sticky glassmorphism navigation.

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router](https://reactrouter.com/) (HashRouter)
- **Internationalization:** [i18next](https://www.i18next.com/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Maps:** Google Maps Embed

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/BrianWong05/macau-pet-eats.git
    cd macau-pet-eats
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory (or use the existing one if committed):
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🚢 Deployment

This project is configured for deployment on **GitHub Pages**.

### Deploying Updates

To build and deploy the latest changes to the `gh-pages` branch:

```bash
npm run deploy
```

The site will be live at: `https://BrianWong05.github.io/macau-pet-eats/`

### Configuration Notes

-   **Base Path:** The project is served from a subdirectory (`/macau-pet-eats/`). `vite.config.ts` handles this conditionally (Root `/` for dev, `/macau-pet-eats/` for prod).
-   **Routing:** Uses `HashRouter` to ensure compatibility with GitHub Pages static hosting.
-   **Supabase Redirects:**
    -   Production: `https://BrianWong05.github.io/macau-pet-eats/**`
    -   Localhost: `http://localhost:5173/**` (Make sure to add these to your Supabase Auth Redirect URLs).

## 🗄️ Database Schema

The project uses Supabase (PostgreSQL). Key tables include:

-   `restaurants`: Stores restaurant details (multilingual names/desc, location, pet policy, gallery images).
-   `reviews`: User reviews and photos linked to restaurants.
-   `profiles`: User profiles (synced with Auth) and admin status.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
