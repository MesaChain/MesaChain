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
    
## 🌍 Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Stellar Network Configuration
STELLAR_NETWORK=testnet  # Options: testnet | mainnet
HORIZON_URL=https://horizon-testnet.stellar.org  # Testnet URL
API_BASE_URL_BACKEND=http://localhost:3000
API_BASE_URL_FRONTEND=http://localhost:5173
```

For the frontend, create a `.env` file in the `apps/frontend` directory with the same variables:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_API_BASE_URL_BACKEND=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL_FRONTEND=http://localhost:5173
```

### Environment Variable Validation

The application uses Zod for environment variable validation. Missing or malformed variables will cause the application to fail fast with descriptive error messages.

### Switching Between Networks

To switch between testnet and mainnet:

1. Update `STELLAR_NETWORK` to either `testnet` or `mainnet`
2. Update `HORIZON_URL` accordingly:
   - Testnet: `https://horizon-testnet.stellar.org`
   - Mainnet: `https://horizon.stellar.org`

### Security Notes

- Never commit real `.env` files to version control
- Store production secrets in GitHub Secrets & Variables
- Use `.env.example` as a template for required variables

## Setting Up the Frontend
=======
## 🎯 Reservation MVP
>>>>>>> f161148 (refactor(api): remove axios in favor of fetch for http requests)

### Prerequisites
- Node.js 18 or higher
- pnpm
- Docker and Docker Compose

### Setup Steps

1. Start PostgreSQL database:
```bash
pnpm docker:up
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate Prisma client:
```bash
cd packages/database
pnpm prisma generate
cd ../..
```

4. Apply migrations:
```bash
cd packages/database
pnpm prisma migrate deploy
cd ../..
```

5. Start development server:
```bash
pnpm dev
```

### API Endpoints

#### Reservations

- `GET /reservations/availability?startTime&endTime&partySize`
  - Get available tables for a specific time slot and party size
  - Parameters:
    - `startTime`: Start date and time (ISO string)
    - `endTime`: End date and time (ISO string)
    - `partySize`: Number of people

- `POST /reservations`
  - Create a new reservation
  - Body:
    ```json
    {
      "userId": "uuid",
      "tableId": "uuid",
      "startTime": "ISO string",
      "endTime": "ISO string",
      "partySize": number
    }
    ```

- `PATCH /reservations/:id/cancel`
  - Cancel an existing reservation
  - Parameters:
    - `id`: Reservation ID

### Development

Run tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

View test coverage:
```bash
pnpm test:cov
```


## Start DB


## 🚀 Development Workflow

After the initial setup, you can use the following commands for development:

- `npm run dev` - Start the application in development mode with hot reloading
- `npm run test` - Run the test suite
- `npm run lint` - Run the linter to check code quality

## ❓ Troubleshooting

If you encounter any dependency issues, try deleting the `node_modules` folder and the `pnpm-lock.yaml` file, then run `pnpm install` again.

Make sure you have the correct versions of Node.js and pnpm installed.

Check the project documentation for any specific environment variables that need to be set.

## 📊 Monitoring & Logging

MesaChain uses Prometheus, Grafana, and the ELK stack for comprehensive monitoring and centralized logging. See `MONITORING.md` for full onboarding and playbook details.

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- Kibana: http://localhost:5601
- Alertmanager: http://localhost:9093

To onboard a new service or respond to alerts, see the quick reference in `README_MONITORING_SNIPPET.md` and the full guide in `MONITORING.md`.

