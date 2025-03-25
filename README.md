# MesaChain 🍽️ 💫

## Restaurant Management Platform Integrated with Stellar Blockchain

![c62168b7-bc5a-49da-ad4e-2d50bb2a4acf](https://github.com/user-attachments/assets/c454e20e-dffa-4195-9557-f5b580bcf122)


## 🚀 Overview

MesaChain revolutionizes the restaurant and café industry by seamlessly integrating comprehensive management tools with the Stellar blockchain. Our platform addresses critical challenges facing food service establishments while leveraging blockchain technology to reduce costs and enhance customer experiences.

## 🎯 Problem We Solve

The restaurant industry currently faces multiple pain points that impact profitability and growth:

- 💸 High payment processing fees (2-4% per transaction)
- 🧩 Fragmented management systems (inventory, staff, sales)
- 🎁 Ineffective and costly loyalty programs
- ⏱️ Slow financial processes (settlements, payments to employees/suppliers)
- 📊 Limited data visibility for decision-making

## 👥 Target Users

- 🍕 Independent restaurant, bar, and café owners and managers
- 🏢 Medium-sized establishment chains (5-50 locations)
- 👨‍🍳 Service staff (waiters, cashiers, chefs)
- 🧑‍💼 Frequent customers of these establishments
- 🚚 Suppliers for the food service sector

## ⚙️ Tech Stack

### Core Technology

- **Backend**: 
  - 🖥️ Node.js/Deno.js
  - 🌐 Express
  - 🗄️ PostgreSQL
  - ⚡ Redis

- **Frontend**: 
  - ⚛️ React (Web/Desktop)
  - 📱 React Native (Mobile)

- **Blockchain**: 
  - 🌟 Stellar SDK
  - 🔄 Horizon API
  - 🔒 Stellar Consensus Protocol

- **Security**: 
  - 🛡️ HSM for key custody
  - 🔐 Multi-factor authentication

- **Data Analysis**: 
  - 🧠 TensorFlow for predictions
  - 📈 Tableau for visualizations

- **Infrastructure**: 
  - ☁️ AWS/Azure
  - 🐳 Docker
  - ⛵ Kubernetes

## 🏗️ Architecture

MesaChain's architecture consists of three main components:

### 1. Core Management Application (Backend)
- REST API for communication between components
- Microservices for different functionalities (inventory, payments, etc.)
- Direct integration with the Stellar network via Horizon API

### 2. User Interfaces (Frontend)
- Responsive web/desktop application for administrators
- Mobile application for customers (Android/iOS)
- Simplified POS terminal for staff

### 3. Blockchain Infrastructure
- Stellar private key custodian
- Custom token issuance and management
- Anchoring system for fiat-crypto conversion

## ✨ Key Features

- **🔄 Integrated Payment System**: Process payments with minimal fees (<$0.001) via Stellar
- **📱 Customer Mobile App**: Order, pay, and manage loyalty points
- **📦 Inventory Management**: Track stock levels and predict future needs
- **👥 Staff Management**: Scheduling, payroll, and performance analytics
- **🎁 Tokenized Loyalty Program**: Create and manage custom loyalty tokens
- **📊 Advanced Analytics**: Make informed decisions with data visualizations
- **🌐 Multi-location Support**: Manage multiple establishments from one dashboard
- **🔌 Supplier Integration**: Streamline ordering and payment processes

## Setting Up the Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd apps/frontend
pnpm install
```

Build the frontend application:

```bash
npm run build
```

Start the frontend application:

```bash
npm run start
```

The frontend application should now be running at [http://localhost:3000](http://localhost:3000).

---

## Setting Up the Backend

Open a new terminal window, navigate to the root of the project, and then to the backend directory:

```bash
cd apps/backend
pnpm install
```

Build the backend application:

```bash
npm run build
```

Start the backend application:

```bash
npm run start
```

The backend API should now be running at [http://localhost:5000](http://localhost:5000).

---

## 🚀 Development Workflow

After the initial setup, you can use the following commands for development:

- `npm run dev` - Start the application in development mode with hot reloading
- `npm run test` - Run the test suite
- `npm run lint` - Run the linter to check code quality

---

## ❓ Troubleshooting

If you encounter any dependency issues, try deleting the `node_modules` folder and the `pnpm-lock.yaml` file, then run `pnpm install` again.

Make sure you have the correct versions of Node.js and pnpm installed.

Check the project documentation for any specific environment variables that need to be set.

