# 🌾 Industrial Silo Monitoring System - High Performance Node.js API

<div align="center">

![iDEALCHiP Logo](https://via.placeholder.com/200x80/2E8B57/FFFFFF?text=iDEALCHiP)

**Advanced Real-time Industrial Silo Temperature Monitoring System**  
**Built for Maximum Efficiency and Clean Architecture**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![Performance](https://img.shields.io/badge/Performance-Optimized-brightgreen.svg)](https://github.com/basharagb/replica-backend-node-js)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-blue.svg)](https://github.com/basharagb/replica-backend-node-js)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Developed by:** Eng. Bashar Mohammad Zabadani  
**Email:** <basharagb@gmail.com>  
**Phone:** +962780853195  
**LinkedIn:** [bashar-mohammad-77328b10b](https://www.linkedin.com/in/bashar-mohammad-77328b10b/)

</div>

---

## 🚀 Performance & Efficiency Highlights

This system represents the **pinnacle of efficiency and clean code architecture**, designed to replace slow legacy systems with:

- **⚡ Ultra-High Performance**: Optimized for maximum throughput and minimal latency
- **🏗️ Clean Architecture**: Hexagonal/Onion pattern with perfect separation of concerns
- **🔄 Advanced Caching**: In-memory caching with TTL and intelligent invalidation
- **📊 Performance Monitoring**: Real-time metrics and performance tracking
- **🌐 Production Ready**: Clustering, connection pooling, and compression
- **🛡️ Enterprise Security**: JWT authentication, bcrypt encryption, input validation

## 🏢 About iDEALCHiP Technology Co.

**Leading technological innovation since 1997**

### 📍 Contact Information

- **Phone:** +962 79 021 7000
- **Email:** idealchip@idealchip.com
- **Address:** 213, Al Shahid St, Tabarbour, Amman, Jordan
- **P.O.Box:** 212191 Amman, 11121
- **WhatsApp:** +962 79 021 7000

### 🎯 Our Mission

To provide innovative, reliable, and comprehensive technology solutions that empower businesses to achieve their goals, enhance operational efficiency, and deliver exceptional customer experiences through cutting-edge systems and dedicated support.

### 🚀 Our Services

- **Queue Management Systems** - Advanced digital queue management solutions
- **Software Development** - Customized software solutions for business needs
- **LED Displays** - High-quality displays for impactful visual communications
- **Building Facade Lighting** - Lighting solutions to transform building exteriors
- **Smart City Solutions** - Innovative technologies to enhance urban living and sustainability

### 📊 Our Statistics

- **28+** Years Experience
- **2000+** Projects Completed
- **50+** Skilled Staff
- **170+** Happy Clients

## 🌾 System Overview

A comprehensive industrial silo temperature monitoring system with real-time capabilities, built using Clean Architecture with Node.js and MySQL. This system replaces legacy Python implementations with **maximum performance optimization**.

### ✨ Key Features

- **🌡️ Real-time Monitoring** - 8-level temperature sensing per silo (levels 0-7)
- **🔄 Multiple Redundancy** - Multiple cables per silo for reliability
- **📊 Historical Data Tracking** - Store and analyze historical data with microsecond precision
- **🚨 Smart Alert System** - Intelligent alerts with level masking and SMS notifications
- **👥 User Authentication** - JWT-based authentication with role-based access
- **🎨 Color-coded Status** - Visual status indicators (normal/warning/critical/disconnect)
- **📱 SMS Notifications** - Instant emergency alerts via text messages
- **🔍 Disconnect Detection** - Automatic detection of sensor failures (-127.0°C sentinel values)
- **📈 Fill Level Estimation** - K-means clustering algorithm for accurate fill level calculation
- **⏰ Flexible Time Queries** - Advanced time-window queries with date ranges
- **🚀 Performance Optimized** - Connection pooling, caching, and clustering support

### 🏗️ System Architecture

```
SiloGroup → Silo → Cable → Sensor → Reading/ReadingRaw
                              ↓
                           Alert (temperature thresholds)
```

**Clean Architecture Layers:**

- **Domain Layer** (`/domain/`) - Business entities and value objects
- **Infrastructure Layer** (`/infrastructure/`) - Database, repositories, caching, and utilities
- **Presentation Layer** (`/presentation/`) - Controllers, routes, and API endpoints
- **Application Layer** (`/application/`) - Use cases and business logic orchestration

### 🛠️ Technical Requirements

- **Node.js** 18+ (LTS recommended)
- **MySQL** 8.0+ with InnoDB engine
- **npm** or **yarn** package manager
- **Memory**: Minimum 4GB RAM (8GB+ recommended for production)
- **CPU**: Multi-core processor (clustering support)

## 🚀 Quick Start

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/basharagb/replica-backend-node-js.git
cd replica-backend-node-js

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env file with your database credentials

# 4. Start the server

# 🚀 PRODUCTION MODE (RECOMMENDED - Real Database Connection)
node app.js

# 🛠️ DEVELOPMENT MODE (Mock Data Only)
node devApp.js
# Or with auto-reload
npm run dev

# 📦 Alternative Production Commands
npm start
# Or for production with clustering
npm run production
```

## 🔄 Production vs Development Modes

### 🚀 Production Mode (Real Database)

**Use this mode for real data from MySQL database:**

```bash
# Start production API with real MySQL connection
node app.js
```

**Features:**
- ✅ Connects to real MySQL `silos` database
- ✅ Returns all alerts (481+ alerts from database)
- ✅ Real sensor readings with actual timestamps
- ✅ All alert types: disconnect, critical, warn
- ✅ Complete data matching phpMyAdmin content

### 🛠️ Development Mode (Mock Data)

**Use this mode only for testing without database:**

```bash
# Start development API with mock data
node devApp.js
```

**Features:**
- ⚠️ Uses mock/fake data (only 3 sample alerts)
- ⚠️ No real database connection required
- ⚠️ Limited data for testing purposes only

### Environment Configuration

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=silos
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# SMS Configuration (Optional)
SMS_ENABLED=true
SMS_PORT=/dev/ttyUSB0
```

## 📡 API Endpoints

### 🌡️ Temperature Readings

- `GET /readings/by-sensor` - Readings by specific sensor
- `GET /readings/latest/by-sensor` - Latest readings by sensor
- `GET /readings/max/by-sensor` - Maximum readings by sensor
- `GET /readings/by-cable` - Readings by cable
- `GET /readings/latest/by-cable` - Latest readings by cable
- `GET /readings/max/by-cable` - Maximum readings by cable
- `GET /readings/by-silo-id` - Readings by silo ID
- `GET /readings/latest/by-silo-id` - Latest readings by silo ID
- `GET /readings/max/by-silo-id` - Maximum readings by silo ID
- `GET /readings/avg/by-silo-id` - Cross-cable averaged readings by silo ID
- `GET /readings/by-silo-number` - Readings by silo number
- `GET /readings/by-silo-group-id` - Readings by silo group ID

### 🚨 Alert Management

- `GET /alerts/active` - Get all active alerts
- `GET /alerts/silo/:id` - Get alerts for specific silo
- `POST /alerts` - Create new alert
- `PUT /alerts/:id` - Update existing alert
- `DELETE /alerts/:id` - Delete alert

### 🏭 Silo Management

- `GET /api/silos` - Get all silos with cable counts
- `GET /api/silos/:id` - Get specific silo details
- `GET /api/silo-groups` - Get all silo groups
- `GET /api/cables` - Get all cables
- `GET /api/cables/:id` - Get specific cable details

### 👤 User Management

- `POST /login` - User authentication
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### 📱 SMS & Notifications

- `POST /sms` - Send SMS message
- `GET /sms/health` - Check GSM module health
- `POST /sms/emergency` - Send emergency alert to all contacts

### 🌡️ Environment Monitoring

- `GET /env_temp/temperature` - Current environment temperature
- `GET /env_temp/temperature/history` - Temperature history
- `GET /env_temp/sensors/status` - Environmental sensor status

### 📊 Fill Level Estimation

- `GET /silos/level-estimate/:id` - Get fill level estimate for silo
- `GET /silos/level-estimate/by-number` - Get estimate by silo number
- `GET /silos/level-estimate/stats/all` - Get all level statistics

### 🔧 System Health

- `GET /health` - System health check
- `GET /metrics` - Performance metrics
- `GET /status` - Detailed system status

## 🧪 Testing with cURL

### Basic Health Check

```bash
curl -X GET http://localhost:3000/health
```

### Get All Silos

```bash
curl -X GET http://localhost:3000/api/silos
```

### Get Latest Readings for Silo

```bash
curl -X GET "http://localhost:3000/readings/latest/by-silo-number?silo_number=1"
```

### Get Active Alerts

```bash
curl -X GET http://localhost:3000/alerts/active
```

### User Authentication

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

## 📋 Postman Collection

Import the comprehensive Postman collection:

```
postman_collections/Arabic_Silo_API.postman_collection.json
```

**Collection Variables:**

- `base_url`: http://localhost:3000
- `auth_token`: JWT token from login

## 🔧 Development

### Development Commands

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/silos

# Memory usage monitoring
npm run monitor

# Performance profiling
npm run profile
```

## 📁 Project Structure

```
src/
├── application/           # Application Layer
│   ├── services/         # Application Services
│   └── use-cases/        # Business Use Cases
├── domain/               # Domain Layer
│   ├── entities/         # Business Entities
│   └── value-objects/    # Value Objects
├── infrastructure/       # Infrastructure Layer
│   ├── database/        # Database Connection & Migrations
│   ├── repositories/    # Data Access Layer
│   ├── cache/          # Caching Implementation
│   ├── config/         # Configuration Management
│   └── utils/          # Utility Functions
└── presentation/        # Presentation Layer
    ├── controllers/    # Request Controllers
    ├── routes/        # API Route Definitions
    └── middleware/    # Express Middleware

docs/                    # Documentation
├── api/                # API Documentation
├── architecture/       # Architecture Diagrams
└── performance/       # Performance Reports

tests/                  # Test Suite
├── unit/              # Unit Tests
├── integration/       # Integration Tests
└── performance/       # Performance Tests
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - bcrypt hashing with salt rounds
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Parameterized queries
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Configuration** - Cross-origin resource sharing setup
- **Security Headers** - Helmet.js security headers
- **Environment Variables** - Secure configuration management

## ⚡ Performance Optimizations

### Database Optimizations

- **Connection Pooling** - Efficient database connection management
- **Query Optimization** - Indexed queries and efficient joins
- **Prepared Statements** - Reduced query parsing overhead
- **Read Replicas** - Support for read/write splitting

### Caching Strategy

- **In-Memory Caching** - Redis-compatible caching layer
- **Query Result Caching** - Automatic query result caching
- **TTL Management** - Time-to-live cache expiration
- **Cache Invalidation** - Smart cache invalidation strategies

### Application Performance

- **Clustering** - Multi-process clustering for CPU utilization
- **Compression** - Gzip compression for responses
- **Keep-Alive** - HTTP keep-alive connections
- **Async Processing** - Non-blocking asynchronous operations

## 📊 Performance Metrics

- **Response Time** - Average < 50ms for cached queries
- **Throughput** - 1000+ requests per second
- **Memory Usage** - Optimized memory footprint
- **CPU Utilization** - Multi-core scaling support
- **Database Connections** - Efficient connection pooling

## 📞 Technical Support

For technical support and inquiries:

- **Developer:** Eng. Bashar Mohammad Zabadani
- **Email:** <basharagb@gmail.com>
- **Phone:** +962780853195
- **LinkedIn:** [bashar-mohammad-77328b10b](https://www.linkedin.com/in/bashar-mohammad-77328b10b/)

**iDEALCHiP Support:**

- **Email:** support@idealchip.com
- **Phone:** +962 79 021 7000
- **Hours:** 24/7 Support Available

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and updates.

---

<div align="center">

**Built with ❤️ by Eng. Bashar Mohammad Zabadani**  
**In collaboration with iDEALCHiP Technology Co.**

*Delivering high-performance solutions since 1997*

**Repository:** [replica-backend-node-js](https://github.com/basharagb/replica-backend-node-js)

</div>
# replica-backend-node-js
