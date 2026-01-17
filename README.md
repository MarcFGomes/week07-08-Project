# 🌍 Globe Lens

A Visual Guide to the World

Globe Lens is an interactive web application that lets users explore countries around the globe through rich visuals, detailed data, and smart comparisons. Users can search by country or capital, view maps, images, and videos, open detailed modals, and compare countries side-by-side to discover meaningful differences.

Designed with a strong focus on UX, clarity, and polish, Globe Lens behaves like a lightweight single-page application without using a frontend framework.

✨ Key Features
🔎 Smart Search

Search by country name or capital city

Deep-linkable searches via URL parameters

Friendly error handling for invalid searches

## 🧾 Country Overview

Flag, capital, region, population, and area

Embedded Google Maps view

Clean, responsive country cards

## 🧠 “More Info” Modal

Opens detailed country information in a focused modal

Official name, languages, currencies, timezones, population, and area

Direct link to Google Maps

Fully keyboard and click accessible (ESC, click-outside, close button)

## 🖼️ Media Experience

High-quality image gallery powered by Unsplash

Video carousel powered by Pexels

Image lightbox modal for full-screen viewing

Pagination for images

## ⚖️ Country Comparison (Highlight Feature)

Add countries to a comparison directly from the modal

Automatically opens compare view when two countries are selected

Side-by-side comparison layout

Automatic highlighting of key differences (population, area, languages)

Clear visual cues to help users understand insights instantly

## 🕘 Search History

Previous searches saved and accessible via dropdown

Quick re-search with one click

## 🌗 Dark Mode

Toggle between light and dark themes

Theme preference preserved across sessions

## ⚡ UX & Performance

Skeleton loading states for smooth transitions

SPA-style behavior (no page reloads)

Fully responsive design (mobile, tablet, desktop)

## 🧪 Technologies Used

✔ HTML5
✔ CSS3
✔ JavaScript (ES6+)
✔ Tailwind CSS
✔ REST Countries API
✔ Unsplash API
✔ Pexels API
✔ Google Maps Embed

## 📸 Demo

![Demo of Globe Lens showing country details and image gallery](assets/images/Demo.gif)

## 🌐 Live Demo 

[View Live Site](https://marcfgomes.github.io/week07-08-Project/) 

## 📂 File Structure
/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── containers.js
│   │   ├── history.js
│   │   ├── search.js
│   │   ├── fetch.js
│   │   ├── render.js
│   │   ├── more_info.js
│   │   ├── compare.js
│   │   ├── mode_toggle.js
│   │   └── home_refresh.js
│   └── images/
│       └── Demo.gif
└── README.md

## 📌 Bootcamp Requirements Met

✔ CSS Framework (Non-Bootstrap)
✔ Multiple Server-Side APIs
✔ Dynamic User Interaction
✔ Responsive Design
✔ Polished UI & UX
✔ Error Handling
✔ GitHub Pages Deployment
✔ Clean Repository Structure
✔ Comprehensive README

##  🚀 Notable Enhancements Beyond Requirements

✔ Modal-based detailed views
✔ Smart country comparison with visual insights
✔ Auto-triggered compare experience
✔ Deep-linkable searches
✔ Strong accessibility patterns
✔ Mobile-first UX fixes and refinements
