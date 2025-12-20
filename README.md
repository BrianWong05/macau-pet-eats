# Macau Pet-Friendly Eats

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

[中文](README_zh.md) | English

A community-driven directory for pet-friendly dining in Macau.

## About the Project

Macau Pet-Friendly Eats solves the problem of finding suitable dining spots for pet owners in Macau. It provides a comprehensive, community-curated list of restaurants and cafes that welcome pets, detailing their specific pet policies and amenities.

### Key Features

*   **Interactive Map**: Easily locate pet-friendly spots near you or in specific districts.
*   **User Auth**: Secure sign-up and login functionality powered by Supabase.
*   **Favorites**: Save your top dining choices for quick access.
*   **Pet Profiles**: Create profiles for your furry friends.
*   **Admin Dashboard**: comprehensive tools for managing restaurant listings and user content.
*   **Multi-language Support**: Fully localized in English, Chinese, and Portuguese (i18next).

## Screenshots

| Home Page | Map View |
|:---:|:---:|
| ![Home Page Placeholder](https://via.placeholder.com/600x400?text=Home+Page) | ![Map View Placeholder](https://via.placeholder.com/600x400?text=Map+View) |

## Tech Stack

### Frontend
*   **React (Vite)**: Fast, modern UI development.
*   **TypeScript**: Type-safe code for better maintainability.
*   **Tailwind CSS**: Utility-first styling for rapid design.

### Backend/DB
*   **Supabase**:
    *   **Auth**: Secure user authentication.
    *   **Postgres**: Robust relational database.
    *   **Storage**: For storing restaurant images and user uploads.
    *   **Edge Functions**: Serverless logic (if applicable).

### Internationalization
*   **i18next**: Implementation with `i18next-http-backend` for lazy loading namespaced translations (`/public/locales`).

### State/Data
*   **React Hooks**: Custom hooks for local state management and data fetching logic.

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js**: v18.0.0 or higher recommended.
*   **Supabase CLI**: (Optional) For local database development.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/BrianWong05/macau-pet-eats.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Environment Setup

1.  Create a `.env.local` file in the root directory.
2.  Add the following variables (you can find these in your Supabase project settings):

    ```env
    VITE_SUPABASE_URL=your_supbase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Running Locally

Start the development server:

```sh
npm run dev
```

## Project Structure

Here is a high-level overview of the project structure:

```text
macau-pet-eats/
├── public/
│   └── locales/       # i18n translation JSON files
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (Auth, Theme, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components (routes)
│   ├── services/      # API and Supabase service calls
│   └── types/         # TypeScript type definitions
├── .env.example       # Example environment variables
└── package.json       # Project dependencies and scripts
```

## Database Setup

This project uses **Supabase** as the backend.

1.  Create a new project on [Supabase](https://supabase.com).
2.  execute the schema setup scripts in the SQL Editor to create the necessary tables (`restaurants`, `profiles`, `reviews`, etc.).
3.  *Note: A `schema.sql` file (if available) can be found in the root or `supabase/` folder to automate this step.*

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
