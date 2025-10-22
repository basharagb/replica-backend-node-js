# 🏭 المرحلة الثانية: نظام إدارة المستودعات الرسومي المتطور
## Phase Two: Advanced Visual Warehouse Management System

<div align="center">

![iDEALCHiP Logo](https://via.placeholder.com/200x80/2E8B57/FFFFFF?text=iDEALCHiP)

**نظام إدارة مستودعات رسومي تفاعلي متطور**  
**Advanced Interactive Visual Warehouse Management System**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![Phase](https://img.shields.io/badge/Phase-Two-brightgreen.svg)](https://github.com/basharagb/replica-backend-node-js)

</div>

---

## 🌟 نظرة عامة على المرحلة الثانية
### Phase Two Overview

بعد إتمام المرحلة الأولى بنجاح (نظام مراقبة درجات الحرارة)، ننتقل الآن إلى المرحلة الثانية المثيرة - تطوير نظام إدارة مستودعات رسومي متطور يختلف تمامًا عن الأنظمة التقليدية.

After successfully completing Phase One (Temperature Monitoring System), we now move to the exciting Phase Two - developing an advanced visual warehouse management system that is completely different from traditional systems.

## 🎯 رؤية النظام الجديد
### New System Vision

### 🖼️ **واجهة رسومية تفاعلية**
- **خريطة رسومية للصوامع**: عرض جميع الصوامع في واجهة رسومية تفاعلية
- **تفاعل مباشر**: النقر على أي صومعة للدخول إلى تفاصيلها
- **تصميم جذاب**: استخدام الصور والرسوم البيانية لعرض المحتويات
- **نظام السحب والإفلات**: إدارة المخزون بطريقة بصرية سهلة

### 📦 **إدارة المخزون المتطورة**
- **عرض المحتويات**: رؤية ما هو مخزن في كل صومعة بشكل مرئي
- **أنواع المواد**: قمح، شعير، ذرة، أرز، وأنواع أخرى من الحبوب
- **الكميات والأحجام**: عرض دقيق للكميات المخزنة والمساحة المتاحة
- **حالة المخزون**: مؤشرات بصرية لحالة الامتلاء والفراغ

### 📅 **جدولة العمليات المستقبلية**
- **الشحنات القادمة**: إضافة شحنات مجدولة (مثال: 2 طن قمح بعد يومين)
- **التخطيط المسبق**: جدولة عمليات الإدخال والإخراج
- **التنبيهات**: تنبيهات للشحنات القادمة والعمليات المجدولة
- **التقويم التفاعلي**: عرض جميع العمليات المجدولة في تقويم

### 🚛 **إدارة الشاحنات والنقل**
- **تتبع الشاحنات**: مراقبة الشاحنات القادمة والمغادرة
- **عمليات التحميل**: إدارة عمليات تحميل وتفريغ المواد
- **التأكيدات**: نظام تأكيد للإدخال والإخراج
- **السجلات**: حفظ سجل كامل لجميع العمليات

## 🏗️ الميزات التقنية المتطورة
### Advanced Technical Features

### 🎨 **واجهة المستخدم الرسومية**
```
🏭 الصفحة الرئيسية - خريطة الصوامع
├── 🌾 صومعة القمح #1 (75% ممتلئة)
├── 🌽 صومعة الذرة #2 (45% ممتلئة)  
├── 🌾 صومعة الشعير #3 (90% ممتلئة)
└── 📦 صومعة فارغة #4 (0% ممتلئة)

📱 عند النقر على صومعة:
├── 📊 تفاصيل المحتويات
├── 📈 الرسوم البيانية
├── ➕ إضافة مواد جديدة
├── ➖ سحب مواد
└── 📅 العمليات المجدولة
```

### 🎮 **نظام السحب والإفلات**
- **سحب المواد**: سحب أيقونات المواد من مستودع إلى صومعة
- **إفلات الكميات**: تحديد الكميات بصريًا
- **تأكيد العمليات**: نوافذ تأكيد جميلة ومتحركة
- **الرسوم المتحركة**: تأثيرات بصرية للعمليات

### 🖼️ **المكتبة البصرية**
```
🌾 أيقونات المواد:
├── 🌾 قمح (Wheat)
├── 🌽 ذرة (Corn)
├── 🌾 شعير (Barley)
├── 🍚 أرز (Rice)
├── 🌱 فول الصويا (Soybean)
└── 📦 مواد أخرى (Other Materials)

🚛 أيقونات النقل:
├── 🚛 شاحنة قادمة
├── 🚚 شاحنة مغادرة
├── ⏰ شحنة مجدولة
└── ✅ عملية مكتملة
```

## 📋 متطلبات النظام الجديد
### New System Requirements

### 🗄️ **قاعدة البيانات الموسعة**
```sql
-- جداول جديدة للمرحلة الثانية
CREATE TABLE material_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    icon_path VARCHAR(255),
    color_code VARCHAR(7),
    density DECIMAL(8,3), -- كثافة المادة
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    silo_id INT NOT NULL,
    material_type_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL, -- بالطن
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    batch_number VARCHAR(50),
    supplier VARCHAR(100),
    quality_grade VARCHAR(20),
    FOREIGN KEY (silo_id) REFERENCES silos(id),
    FOREIGN KEY (material_type_id) REFERENCES material_types(id)
);

CREATE TABLE scheduled_operations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    silo_id INT NOT NULL,
    operation_type ENUM('IN', 'OUT') NOT NULL,
    material_type_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    scheduled_date DATETIME NOT NULL,
    truck_info VARCHAR(255),
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (silo_id) REFERENCES silos(id),
    FOREIGN KEY (material_type_id) REFERENCES material_types(id)
);

CREATE TABLE truck_operations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    truck_plate VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100),
    operation_type ENUM('LOADING', 'UNLOADING') NOT NULL,
    silo_id INT NOT NULL,
    material_type_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'WAITING',
    confirmation_code VARCHAR(10),
    FOREIGN KEY (silo_id) REFERENCES silos(id),
    FOREIGN KEY (material_type_id) REFERENCES material_types(id)
);
```

### 🎨 **التقنيات المستخدمة**
```json
{
  "frontend": {
    "framework": "React 18+",
    "ui_library": "Material-UI / Ant Design",
    "drag_drop": "react-beautiful-dnd",
    "charts": "Chart.js / D3.js",
    "animations": "Framer Motion",
    "icons": "React Icons / Custom SVG"
  },
  "backend": {
    "api": "Node.js + Express (existing)",
    "new_endpoints": "Warehouse Management APIs",
    "file_upload": "Multer (for images)",
    "scheduling": "node-cron",
    "notifications": "Socket.io (real-time)"
  },
  "database": {
    "existing": "MySQL silos database",
    "new_tables": "Inventory, Materials, Operations",
    "migrations": "Database migration scripts"
  }
}
```

## 🚀 خطة التطوير المرحلية
### Phased Development Plan

### 📅 **المرحلة 2.1: الأساسيات (أسبوعين)**
- ✅ تصميم قاعدة البيانات الجديدة
- ✅ إنشاء الجداول والعلاقات
- ✅ تطوير APIs الأساسية للمخزون
- ✅ واجهة عرض الصوامع الأساسية

### 📅 **المرحلة 2.2: الواجهة الرسومية (3 أسابيع)**
- 🎨 تصميم واجهة الصوامع التفاعلية
- 🖱️ تطبيق نظام النقر والتفاعل
- 📊 عرض بيانات المخزون بصريًا
- 🎮 تطوير نظام السحب والإفلات الأساسي

### 📅 **المرحلة 2.3: إدارة العمليات (أسبوعين)**
- 📅 نظام جدولة العمليات
- 🚛 إدارة الشاحنات
- ✅ نظام التأكيدات
- 📱 التنبيهات والإشعارات

### 📅 **المرحلة 2.4: التحسينات والتطوير (أسبوع)**
- 🎨 تحسين التصميم والرسوم المتحركة
- 📊 تقارير متقدمة
- 🔍 البحث والفلترة
- 🔒 الأمان والصلاحيات

## 🎯 الميزات المتقدمة المخططة
### Planned Advanced Features

### 🤖 **الذكاء الاصطناعي والتحليلات**
- **التنبؤ بالاستهلاك**: تحليل أنماط الاستهلاك والتنبؤ بالاحتياجات
- **الأمثلة التلقائية**: اقتراح أفضل توزيع للمواد على الصوامع
- **كشف الأنماط**: تحليل البيانات لاكتشاف الأنماط غير العادية
- **التحسين التلقائي**: تحسين عمليات التخزين والاسترجاع

### 📱 **التطبيق المحمول**
- **تطبيق للسائقين**: تطبيق خاص لسائقي الشاحنات
- **المسح الضوئي**: مسح QR codes للتأكيد السريع
- **التتبع المباشر**: تتبع موقع الشاحنات في الوقت الفعلي
- **الإشعارات الفورية**: تنبيهات فورية للعمليات

### 🌐 **التكامل مع الأنظمة الخارجية**
- **أنظمة ERP**: التكامل مع أنظمة تخطيط الموارد
- **أنظمة المحاسبة**: ربط العمليات بالحسابات المالية
- **أنظمة النقل**: التكامل مع شركات النقل
- **أنظمة الجودة**: ربط بيانات الجودة والفحص

## 🛠️ دليل البدء السريع
### Quick Start Guide

### 1️⃣ **إعداد البيئة**
```bash
# تحديث المشروع الحالي
cd /Users/macbookair/Downloads/silos/backend
git checkout -b phase-two-warehouse-management

# إضافة المكتبات الجديدة
npm install multer socket.io node-cron
npm install --save-dev @types/multer

# تحديث قاعدة البيانات
mysql -u root -p silos < migrations/phase_two_schema.sql
```

### 2️⃣ **تشغيل النظام المطور**
```bash
# تشغيل API الموسع (يتضمن المرحلة الأولى + الثانية)
node app.js

# تشغيل الواجهة الأمامية الجديدة
cd ../frontend
npm install
npm start
```

### 3️⃣ **الوصول للنظام**
- **API الأساسي**: http://localhost:3000 (المرحلة الأولى)
- **API المستودعات**: http://localhost:3000/api/warehouse (المرحلة الثانية)
- **الواجهة الرسومية**: http://localhost:3001 (النظام الجديد)
- **لوحة التحكم**: http://localhost:3001/dashboard

## 📊 أمثلة على الواجهات الجديدة
### New Interface Examples

### 🏭 **الصفحة الرئيسية - خريطة الصوامع**
```
┌─────────────────────────────────────────────────────┐
│  🏭 نظام إدارة المستودعات - خريطة الصوامع           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌾      🌽      🌾      📦      🌱               │
│ صومعة 1   صومعة 2   صومعة 3   صومعة 4   صومعة 5      │
│ قمح 75%  ذرة 45%  شعير 90%  فارغة 0%  صويا 60%    │
│                                                     │
│ 📊 إحصائيات سريعة:                                │
│ • إجمالي الصوامع: 150                              │
│ • الصوامع المستخدمة: 120                           │
│ • الصوامع الفارغة: 30                              │
│ • إجمالي المخزون: 2,450 طن                        │
└─────────────────────────────────────────────────────┘
```

### 📦 **صفحة تفاصيل الصومعة**
```
┌─────────────────────────────────────────────────────┐
│  🌾 صومعة القمح #1 - التفاصيل                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 المحتويات الحالية:                             │
│  🌾 قمح أحمر شتوي: 45.5 طن (75%)                  │
│  📅 تاريخ الدخول: 2025-10-15                       │
│  🏭 المورد: شركة الحبوب الذهبية                    │
│  ⭐ درجة الجودة: A+                               │
│                                                     │
│  🚛 العمليات المجدولة:                             │
│  ➕ إضافة 2 طن قمح - بعد يومين                    │
│  ➖ سحب 10 طن قمح - الأسبوع القادم                │
│                                                     │
│  🎮 العمليات السريعة:                              │
│  [➕ إضافة مواد] [➖ سحب مواد] [📅 جدولة]         │
└─────────────────────────────────────────────────────┘
```

## 🎨 التصميم والألوان
### Design and Colors

### 🌈 **نظام الألوان**
```css
:root {
  /* ألوان المواد */
  --wheat-color: #F4A460;      /* لون القمح */
  --corn-color: #FFD700;       /* لون الذرة */
  --barley-color: #DEB887;     /* لون الشعير */
  --rice-color: #F5F5DC;       /* لون الأرز */
  --soybean-color: #9ACD32;    /* لون فول الصويا */
  
  /* ألوان الحالة */
  --full-color: #FF6B6B;       /* ممتلئ */
  --medium-color: #FFE66D;     /* متوسط */
  --low-color: #4ECDC4;        /* منخفض */
  --empty-color: #95E1D3;      /* فارغ */
  
  /* ألوان العمليات */
  --incoming-color: #6BCF7F;   /* قادم */
  --outgoing-color: #FF8B94;   /* مغادر */
  --scheduled-color: #A8E6CF;  /* مجدول */
}
```

### 🎭 **الرسوم المتحركة**
- **تأثيرات الانتقال**: انتقالات سلسة بين الصفحات
- **الرسوم المتحركة للعمليات**: تحريك المواد بصريًا أثناء النقل
- **مؤشرات التحميل**: مؤشرات جميلة أثناء العمليات
- **التفاعلات البصرية**: تأثيرات عند التمرير والنقر

## 📞 الدعم والتطوير
### Support and Development

### 👨‍💻 **فريق التطوير**
- **المطور الرئيسي**: Eng. Bashar Mohammad Zabadani
- **البريد الإلكتروني**: <basharagb@gmail.com>
- **الهاتف**: +962780853195
- **LinkedIn**: [bashar-mohammad-77328b10b](https://www.linkedin.com/in/bashar-mohammad-77328b10b/)

### 🏢 **شركة iDEALCHiP**
- **الهاتف**: +962 79 021 7000
- **البريد الإلكتروني**: idealchip@idealchip.com
- **العنوان**: 213, شارع الشهيد، طبربور، عمان، الأردن

### 📈 **خطة التطوير المستقبلية**
- **المرحلة الثالثة**: نظام إدارة الجودة والفحص
- **المرحلة الرابعة**: التكامل مع إنترنت الأشياء (IoT)
- **المرحلة الخامسة**: الذكاء الاصطناعي والتعلم الآلي

---

<div align="center">

**🌾 المرحلة الثانية: نظام إدارة المستودعات الرسومي**  
**Phase Two: Visual Warehouse Management System**

**تم التطوير بواسطة Eng. Bashar Mohammad Zabadani**  
**بالتعاون مع شركة iDEALCHiP Technology Co.**

*نقدم حلول تقنية مبتكرة منذ 1997*

**المستودع**: [replica-backend-node-js](https://github.com/basharagb/replica-backend-node-js)

</div>
