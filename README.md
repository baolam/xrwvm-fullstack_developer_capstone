# xrwvm-fullstack_developer_capstone
## Cars Dealership - Full-Stack Web Application

### Repository Name:
`xrwvm-fullstack_developer_capstone`

### Project Name:
`Cars Dealership`

## Project Overview
**Cars Dealership** is a comprehensive, responsive full-stack web application designed for a national car retailer in the United States. The platform enables customers to browse dealership branches across all 50 states, filter dealerships by location, view real-time inventory and customer reviews with automated sentiment analysis, and submit new reviews after purchasing vehicles.

## Architecture & Microservices
The system is built using a modern microservices architecture:
1. **Frontend**: Interactive Single Page Application (SPA) built with **React**, **HTML5**, **CSS3**, and **Bootstrap**.
2. **Main Application Backend**: **Django** (Python) framework handling user authentication, session management, car models/makes, and reverse proxying requests.
3. **Dealership & Review Microservice**: **Node.js** and **Express.js** backed by **MongoDB** (via Mongoose) to manage dealership records and customer reviews.
4. **Sentiment Analyzer Microservice**: **Python** & **Flask** application utilizing **NLTK (VADER)** to perform real-time sentiment analysis on customer reviews.
5. **Database**: 
   - **SQLite** for relational car makes, car models, and user credentials.
   - **MongoDB** for unstructured dealership locations and customer reviews.
6. **DevOps & Deployment**: **Docker** containerization, **Kubernetes**, **CI/CD with GitHub Actions**, and deployment to **IBM Cloud Code Engine**.

## Key Features
- **User Management**: User registration, login, logout, and session state persistence.
- **Dealership Directory**: Search and filter dealership branches by US states.
- **Dealer Reviews & Sentiment Analysis**: View user reviews labeled with visual sentiment badges (Positive, Neutral, Negative) computed dynamically.
- **Review Submission**: Authenticated users can write and post reviews with car make, model, purchase year, and custom comments.
- **Admin Portal**: Django administration console to manage car brands, models, and registered accounts.

## Tech Stack
- **Frontend**: React 18, React Router v6, Bootstrap 5
- **Backend**: Django 3.2+ / Python 3.x, Express.js / Node.js
- **Databases**: SQLite3, MongoDB
- **NLP / ML**: NLTK SentimentIntensityAnalyzer
- **DevOps**: Docker, Kubernetes, GitHub Actions CI/CD, IBM Cloud Code Engine

## Authors & Acknowledgments
- Developed by **Bao Lam** as part of the IBM Full Stack Software Developer Capstone Project (`xrwvm-fullstack_developer_capstone`).
