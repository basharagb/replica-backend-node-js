# 🌾 نظام مراقبة الصوامع الصناعية | Industrial Silo Monitoring System

<div align="center">

![iDEALCHiP Logo](https://via.placeholder.com/200x80/2E8B57/FFFFFF?text=iDEALCHiP)

**نظام متقدم لمراقبة درجة حرارة الصوامع الصناعية في الوقت الفعلي**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 🏢 عن شركة iDEALCHiP

**شركة iDEALCHiP للتكنولوجيا** - رائدة في مجال الابتكار التكنولوجي منذ عام 1997

#### 📍 معلومات الاتصال
- **الهاتف:** 7000 021 79 962+
- **البريد الإلكتروني:** idealchip@idealchip.com
- **العنوان:** 213، شارع الشهيد، طبربور، عمان، الأردن
- **صندوق البريد:** 212191 عمان، 11121
- **واتساب:** 7000 021 79 962+

#### 🎯 مهمتنا
تقديم حلول تكنولوجية مبتكرة وموثوقة وشاملة تمكن الشركات من تحقيق أهدافها وتعزيز الكفاءة التشغيلية وتقديم تجارب استثنائية للعملاء من خلال الأنظمة المتطورة والدعم المتخصص.

#### 🚀 خدماتنا
- **أنظمة إدارة الطوابير** - حلول رقمية متقدمة لإدارة طوابير العملاء
- **تطوير البرمجيات** - حلول برمجية مخصصة حسب احتياجات العمل
- **شاشات LED** - شاشات عالية الجودة للاتصالات المرئية المؤثرة
- **إضاءة واجهات المباني** - حلول الإضاءة لتحويل الواجهات الخارجية
- **حلول المدن الذكية** - تقنيات مبتكرة لتعزيز الحياة الحضرية والاستدامة

#### 📊 إحصائياتنا
- **28+** سنة من الخبرة
- **2000+** مشروع مكتمل
- **50+** موظف مهرة
- **170+** عميل راضٍ

### 🌾 حول نظام مراقبة الصوامع

نظام شامل لمراقبة درجة حرارة الصوامع الصناعية في الوقت الفعلي، مصمم باستخدام معمارية نظيفة (Clean Architecture) مع Node.js و MySQL.

#### ✨ الميزات الرئيسية

- **🌡️ مراقبة في الوقت الفعلي** - 8 مستويات استشعار لكل صومعة (المستويات 0-7)
- **🔄 التكرار المتعدد** - كابلات متعددة لكل صومعة لضمان الموثوقية
- **📊 تتبع البيانات التاريخية** - تخزين وتحليل البيانات التاريخية
- **🚨 نظام التنبيهات** - تنبيهات ذكية مع إخفاء المستويات
- **👥 مصادقة المستخدمين** - نظام مصادقة مع أدوار متعددة
- **🎨 نظام الألوان المرمز** - (طبيعي/تحذير/حرج/انقطاع)
- **📱 إشعارات SMS** - تنبيهات فورية عبر الرسائل النصية
- **🔍 كشف الانقطاع** - كشف قيم الحارس (-127.0°C)
- **📈 تقدير مستوى الملء** - باستخدام خوارزمية K-means
- **⏰ استعلامات النوافذ الزمنية** - نطاقات تاريخ مرنة

#### 🏗️ معمارية النظام

```
مجموعة الصوامع → الصومعة → الكابل → المستشعر → القراءة/القراءة الخام
                                    ↓
                                  التنبيه (حدود درجة الحرارة)
```

**طبقات المعمارية:**
- **طبقة المجال** - كيانات الأعمال وكائنات القيمة
- **طبقة البنية التحتية** - قاعدة البيانات والمستودعات والأدوات
- **طبقة العرض** - وحدات التحكم والمسارات

#### 🛠️ المتطلبات التقنية

- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** أو **yarn**

#### 🚀 التثبيت والتشغيل

```bash
# 1. استنساخ المشروع
git clone <repository-url>
cd API

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# قم بتحرير ملف .env وإدخال بيانات قاعدة البيانات

# 4. تشغيل الخادم
npm start

# أو للتطوير مع إعادة التحميل التلقائي
npm run dev
```

#### 📡 نقاط النهاية (API Endpoints)

##### 🌡️ القراءات
- `GET /readings/by-sensor` - قراءات حسب المستشعر
- `GET /readings/latest/by-sensor` - أحدث قراءات حسب المستشعر
- `GET /readings/max/by-sensor` - أعلى قراءات حسب المستشعر
- `GET /readings/by-cable` - قراءات حسب الكابل
- `GET /readings/latest/by-cable` - أحدث قراءات حسب الكابل
- `GET /readings/max/by-cable` - أعلى قراءات حسب الكابل
- `GET /readings/by-silo-id` - قراءات حسب معرف الصومعة
- `GET /readings/latest/by-silo-id` - أحدث قراءات حسب معرف الصومعة
- `GET /readings/max/by-silo-id` - أعلى قراءات حسب معرف الصومعة
- `GET /readings/avg/by-silo-id` - قراءات متوسطة حسب معرف الصومعة
- `GET /readings/by-silo-number` - قراءات حسب رقم الصومعة
- `GET /readings/by-silo-group-id` - قراءات حسب معرف مجموعة الصوامع

##### 🚨 التنبيهات
- `GET /alerts/active` - التنبيهات النشطة
- `GET /alerts/silo/:id` - تنبيهات حسب معرف الصومعة
- `POST /alerts` - إنشاء تنبيه جديد
- `PUT /alerts/:id` - تحديث تنبيه
- `DELETE /alerts/:id` - حذف تنبيه

##### 👤 المستخدمين
- `POST /login` - تسجيل الدخول
- `GET /api/users` - جلب جميع المستخدمين
- `POST /api/users` - إنشاء مستخدم جديد
- `PUT /api/users/:id` - تحديث مستخدم

##### 📱 الرسائل النصية
- `POST /sms` - إرسال رسالة نصية
- `GET /sms/health` - فحص حالة GSM
- `POST /sms/emergency` - إرسال تنبيه طوارئ

##### 🌡️ البيئة
- `GET /env_temp/temperature` - درجة الحرارة البيئية الحالية
- `GET /env_temp/temperature/history` - سجل درجات الحرارة
- `GET /env_temp/sensors/status` - حالة أجهزة الاستشعار

##### 📊 مستوى الملء
- `GET /silos/level-estimate/:id` - تقدير مستوى الملء
- `GET /silos/level-estimate/by-number` - تقدير حسب رقم الصومعة
- `GET /silos/level-estimate/stats/all` - إحصائيات جميع المستويات

#### 📋 مجموعة Postman

استخدم مجموعة Postman المتوفرة في:
```
postman_collections/Arabic_Silo_API.postman_collection.json
```

المتغيرات:
- `base_url`: http://localhost:3000

#### 🔧 التطوير

```bash
# تشغيل في وضع التطوير
npm run dev

# تشغيل الاختبارات
npm test

# فحص الكود
npm run lint
```

#### 📁 هيكل المشروع

```
src/
├── domain/                 # طبقة المجال
│   ├── entities/          # كيانات الأعمال
│   └── value-objects/     # كائنات القيمة
├── infrastructure/        # طبقة البنية التحتية
│   ├── database/         # اتصال قاعدة البيانات
│   ├── repositories/     # مستودعات البيانات
│   ├── config/          # إعدادات النظام
│   └── utils/           # أدوات مساعدة
└── presentation/         # طبقة العرض
    ├── controllers/     # وحدات التحكم
    └── routes/         # مسارات API
```

#### 🛡️ الأمان

- مصادقة JWT للمستخدمين
- تشفير كلمات المرور باستخدام bcrypt
- التحقق من صحة المدخلات
- معالجة الأخطاء الآمنة

#### 📞 الدعم الفني

للحصول على الدعم الفني، يرجى التواصل معنا:
- **البريد الإلكتروني:** support@idealchip.com
- **الهاتف:** 7000 021 79 962+
- **ساعات العمل:** 24/7

---

## English

### 🏢 About iDEALCHiP

**iDEALCHiP Technology Co.** - Leading technological innovation since 1997

#### 📍 Contact Information
- **Phone:** +962 79 021 7000
- **Email:** idealchip@idealchip.com
- **Address:** 213, Al Shahid St, Tabarbour, Amman, Jordan
- **P.O.Box:** 212191 Amman, 11121
- **WhatsApp:** +962 79 021 7000

#### 🎯 Our Mission
To provide innovative, reliable, and comprehensive technology solutions that empower businesses to achieve their goals, enhance operational efficiency, and deliver exceptional customer experiences through cutting-edge systems and dedicated support.

#### 🚀 Our Services
- **Queue Management Systems** - Advanced digital queue management solutions
- **Software Development** - Customized software solutions for business needs
- **LED Displays** - High-quality displays for impactful visual communications
- **Building Facade Lighting** - Lighting solutions to transform building exteriors
- **Smart City Solutions** - Innovative technologies to enhance urban living and sustainability

#### 📊 Our Statistics
- **28+** Years Experience
- **2000+** Projects Completed
- **50+** Skilled Staff
- **170+** Happy Clients

### 🌾 About Silo Monitoring System

A comprehensive industrial silo temperature monitoring system with real-time capabilities, built using Clean Architecture with Node.js and MySQL.

#### ✨ Key Features

- **🌡️ Real-time Monitoring** - 8-level temperature sensing per silo (levels 0-7)
- **🔄 Multiple Redundancy** - Multiple cables per silo for reliability
- **📊 Historical Data Tracking** - Store and analyze historical data
- **🚨 Alert System** - Smart alerts with level masking
- **👥 User Authentication** - Authentication system with multiple roles
- **🎨 Color-coded Status System** - (normal/warning/critical/disconnect)
- **📱 SMS Notifications** - Instant alerts via text messages
- **🔍 Disconnect Detection** - Detect sentinel values (-127.0°C)
- **📈 Fill Level Estimation** - Using K-means clustering algorithm
- **⏰ Time-window Queries** - Flexible date ranges

#### 🏗️ System Architecture

```
SiloGroup → Silo → Cable → Sensor → Reading/ReadingRaw
                              ↓
                           Alert (temperature thresholds)
```

**Architecture Layers:**
- **Domain Layer** - Business entities and value objects
- **Infrastructure Layer** - Database, repositories, and utilities
- **Presentation Layer** - Controllers and routes

#### 🛠️ Technical Requirements

- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** or **yarn**

#### 🚀 Installation & Setup

```bash
# 1. Clone the project
git clone <repository-url>
cd API

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env file and enter your database credentials

# 4. Start the server
npm start

# Or for development with auto-reload
npm run dev
```

#### 📡 API Endpoints

##### 🌡️ Readings
- `GET /readings/by-sensor` - Readings by sensor
- `GET /readings/latest/by-sensor` - Latest readings by sensor
- `GET /readings/max/by-sensor` - Max readings by sensor
- `GET /readings/by-cable` - Readings by cable
- `GET /readings/latest/by-cable` - Latest readings by cable
- `GET /readings/max/by-cable` - Max readings by cable
- `GET /readings/by-silo-id` - Readings by silo ID
- `GET /readings/latest/by-silo-id` - Latest readings by silo ID
- `GET /readings/max/by-silo-id` - Max readings by silo ID
- `GET /readings/avg/by-silo-id` - Average readings by silo ID
- `GET /readings/by-silo-number` - Readings by silo number
- `GET /readings/by-silo-group-id` - Readings by silo group ID

##### 🚨 Alerts
- `GET /alerts/active` - Active alerts
- `GET /alerts/silo/:id` - Alerts by silo ID
- `POST /alerts` - Create new alert
- `PUT /alerts/:id` - Update alert
- `DELETE /alerts/:id` - Delete alert

##### 👤 Users
- `POST /login` - User login
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

##### 📱 SMS
- `POST /sms` - Send SMS message
- `GET /sms/health` - GSM health check
- `POST /sms/emergency` - Send emergency alert

##### 🌡️ Environment
- `GET /env_temp/temperature` - Current environment temperature
- `GET /env_temp/temperature/history` - Temperature history
- `GET /env_temp/sensors/status` - Sensor status

##### 📊 Fill Level
- `GET /silos/level-estimate/:id` - Fill level estimate
- `GET /silos/level-estimate/by-number` - Estimate by silo number
- `GET /silos/level-estimate/stats/all` - All level statistics

#### 📋 Postman Collection

Use the provided Postman collection at:
```
postman_collections/Arabic_Silo_API.postman_collection.json
```

Variables:
- `base_url`: http://localhost:3000

#### 🔧 Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

#### 📁 Project Structure

```
src/
├── domain/                 # Domain Layer
│   ├── entities/          # Business Entities
│   └── value-objects/     # Value Objects
├── infrastructure/        # Infrastructure Layer
│   ├── database/         # Database Connection
│   ├── repositories/     # Data Repositories
│   ├── config/          # System Configuration
│   └── utils/           # Helper Utilities
└── presentation/         # Presentation Layer
    ├── controllers/     # Controllers
    └── routes/         # API Routes
```

#### 🛡️ Security

- JWT authentication for users
- Password encryption using bcrypt
- Input validation
- Safe error handling

#### 📞 Technical Support

For technical support, please contact us:
- **Email:** support@idealchip.com
- **Phone:** +962 79 021 7000
- **Hours:** 24/7

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and updates.

---

<div align="center">

**Built with ❤️ by iDEALCHiP Technology Co.**

*Building the future of queue management systems since 1997*

</div>
