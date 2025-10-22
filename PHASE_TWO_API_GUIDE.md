# 🏭 Phase Two: Warehouse Management System - API Guide

## 📋 15 New APIs Created

This document provides a comprehensive guide to the 15 new APIs created for Phase Two of the Silo Monitoring System.

### 🚀 Quick Start

1. **Run Database Migration:**
```bash
mysql -u root -p silos < migrations/phase_two_tables.sql
```

2. **Start the Server:**
```bash
node app.js
```

3. **Test the APIs:**
All APIs are available under the `/warehouse` prefix.

---

## 📦 Material Types APIs (4 endpoints)

### 1. GET /warehouse/materials
**Description:** Get all material types  
**Arabic:** جلب قائمة المواد المخزنة

```bash
curl -X GET "http://localhost:3000/warehouse/materials"
```

**Query Parameters:**
- `include_inactive` (boolean): Include inactive materials
- `with_inventory` (boolean): Include inventory count

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wheat",
      "nameAr": "قمح",
      "colorCode": "#F4A460",
      "density": 0.780,
      "unit": "tons",
      "notes": "Premium wheat grains"
    }
  ],
  "count": 6
}
```

### 2. POST /warehouse/materials
**Description:** Create new material type  
**Arabic:** إنشاء نوع مادة جديد

```bash
curl -X POST "http://localhost:3000/warehouse/materials" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Rice",
    "name_ar": "أرز فاخر",
    "description": "High quality rice grains",
    "color_code": "#F5F5DC",
    "density": 0.750,
    "unit": "tons",
    "notes": "Premium quality rice for export"
  }'
```

### 3. PATCH /warehouse/materials/:id
**Description:** Update material type  
**Arabic:** تعديل نوع مادة موجود

```bash
curl -X PATCH "http://localhost:3000/warehouse/materials/1" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated material notes",
    "density": 0.785
  }'
```

### 4. DELETE /warehouse/materials/:id
**Description:** Delete material type (soft delete)  
**Arabic:** حذف نوع مادة

```bash
curl -X DELETE "http://localhost:3000/warehouse/materials/1"
```

---

## 🏭 Warehouse Silos APIs (3 endpoints)

### 5. GET /warehouse/silos
**Description:** Get all warehouse silos with inventory  
**Arabic:** عرض الصوامع مع المخزون

```bash
curl -X GET "http://localhost:3000/warehouse/silos"
```

**Query Parameters:**
- `silo_id`: Filter by silo ID
- `material_type_id`: Filter by material type
- `min_quantity`: Minimum quantity filter
- `expiring_soon`: Days until expiry

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "siloId": 1,
      "siloNumber": 1,
      "siloGroupName": "Group A",
      "inventory": [
        {
          "materialName": "Wheat",
          "quantity": 45.5,
          "availableQuantity": 40.0,
          "reservedQuantity": 5.5
        }
      ],
      "totalQuantity": 45.5,
      "materialTypes": 1
    }
  ]
}
```

### 6. GET /warehouse/silo/:id
**Description:** Get specific silo inventory details  
**Arabic:** تفاصيل مخزون صومعة معينة

```bash
curl -X GET "http://localhost:3000/warehouse/silo/1"
```

### 7. PATCH /warehouse/silo/:id
**Description:** Update silo inventory notes  
**Arabic:** تحديث ملاحظات الصومعة

```bash
curl -X PATCH "http://localhost:3000/warehouse/silo/1" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated silo maintenance notes"
  }'
```

---

## 🚛 Shipments APIs (5 endpoints)

### 8. GET /warehouse/shipments
**Description:** Get all shipments with pagination  
**Arabic:** عرض جميع الشحنات

```bash
curl -X GET "http://localhost:3000/warehouse/shipments?page=1&limit=10"
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `type`: INCOMING or OUTGOING
- `status`: SCHEDULED, IN_PROGRESS, COMPLETED, etc.
- `silo_id`: Filter by silo
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)

### 9. POST /warehouse/silo/:id/incoming
**Description:** Create incoming shipment  
**Arabic:** تسجيل شحنة قادمة (2 طن قمح بعد يومين)

```bash
curl -X POST "http://localhost:3000/warehouse/silo/1/incoming" \
  -H "Content-Type: application/json" \
  -d '{
    "material_type_id": 1,
    "quantity": 25.5,
    "scheduled_date": "2025-10-25T10:00:00",
    "truck_plate": "ABC-123",
    "driver_name": "أحمد محمد",
    "driver_phone": "+962791234567",
    "supplier": "شركة الحبوب الذهبية",
    "notes": "شحنة قمح عالي الجودة - 2 طن كما هو مخطط"
  }'
```

### 10. POST /warehouse/silo/:id/outgoing
**Description:** Create outgoing shipment  
**Arabic:** تسجيل شحنة صادرة

```bash
curl -X POST "http://localhost:3000/warehouse/silo/1/outgoing" \
  -H "Content-Type: application/json" \
  -d '{
    "material_type_id": 1,
    "quantity": 15.0,
    "scheduled_date": "2025-10-26T14:00:00",
    "truck_plate": "XYZ-789",
    "driver_name": "محمد علي",
    "customer": "مطاحن الشرق",
    "notes": "شحنة قمح للعميل الرئيسي"
  }'
```

### 11. PATCH /warehouse/shipment/:id/confirm
**Description:** Confirm shipment completion  
**Arabic:** تأكيد إتمام الشحنة

```bash
curl -X PATCH "http://localhost:3000/warehouse/shipment/1/confirm"
```

### 12. DELETE /warehouse/shipment/:id
**Description:** Cancel/Delete shipment  
**Arabic:** إلغاء شحنة

```bash
curl -X DELETE "http://localhost:3000/warehouse/shipment/1" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "تأخير في وصول الشاحنة"
  }'
```

---

## 📊 Analytics / Reports APIs (3 endpoints)

### 13. GET /warehouse/analytics/fill-level
**Description:** Get fill level analytics for all silos  
**Arabic:** تحليل امتلاء الصوامع

```bash
curl -X GET "http://localhost:3000/warehouse/analytics/fill-level"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "silos": [
      {
        "siloId": 1,
        "siloNumber": 1,
        "totalQuantity": 75.5,
        "utilizationPercentage": 75.5,
        "status": "high",
        "materials": [
          {
            "materialName": "Wheat",
            "quantity": 75.5,
            "colorCode": "#F4A460"
          }
        ]
      }
    ],
    "summary": {
      "totalSilos": 150,
      "occupiedSilos": 120,
      "emptySilos": 30,
      "avgUtilization": 65.2
    }
  }
}
```

### 14. GET /warehouse/analytics/prediction
**Description:** Get inventory prediction analytics  
**Arabic:** توقع المخزون للأيام القادمة

```bash
curl -X GET "http://localhost:3000/warehouse/analytics/prediction?days=30"
```

**Query Parameters:**
- `days`: Number of days to predict (default: 30)

### 15. GET /warehouse/analytics/shipments
**Description:** Get shipment analytics and reports  
**Arabic:** تحليل الشحنات وتقارير الأداء

```bash
curl -X GET "http://localhost:3000/warehouse/analytics/shipments?date_from=2025-10-01&date_to=2025-10-31"
```

---

## 🎮 Drag & Drop System Features

The APIs support the visual drag & drop system mentioned in your requirements:

### Material Icons Available:
- 🌾 Wheat (`/icons/wheat.svg`)
- 🌽 Corn (`/icons/corn.svg`) 
- 🌾 Barley (`/icons/barley.svg`)
- 🍚 Rice (`/icons/rice.svg`)
- 🌱 Soybean (`/icons/soybean.svg`)

### Status Colors:
- **Empty**: `#95E1D3`
- **Low**: `#4ECDC4` 
- **Medium**: `#FFE66D`
- **High**: `#FF8B94`
- **Full**: `#FF6B6B`

### Shipment Status Colors:
- **Scheduled**: `#4ECDC4`
- **In Transit**: `#FFE66D`
- **Arrived**: `#A8E6CF`
- **In Progress**: `#FF8B94`
- **Completed**: `#6BCF7F`
- **Cancelled**: `#FF6B6B`

---

## 📝 Notes Feature

All warehouse entities support optional notes:

### Material Types:
- Add notes about material specifications
- Quality requirements
- Storage conditions

### Silo Inventory:
- Batch information
- Quality grades
- Supplier details
- Expiry dates

### Shipments:
- Delivery instructions
- Special handling requirements
- Customer preferences

---

## 🔧 Database Schema

The Phase Two system adds these new tables to the existing `silos` database:

- `material_types` - Types of materials (wheat, corn, etc.)
- `warehouse_inventory` - Current inventory in each silo
- `shipments` - Incoming and outgoing shipments
- `shipment_operations` - Detailed operation logs
- `silo_notes` - Additional notes for silos

All tables include proper foreign key relationships with the existing Phase One tables (`silos`, `silo_groups`, etc.).

---

## 🚀 Testing

Run the test script to verify all APIs:

```bash
node test_phase_two_apis.js
```

This will display all 15 APIs with example requests and descriptions in both English and Arabic.

---

## 📞 Support

For technical support:
- **Developer:** Eng. Bashar Mohammad Zabadani
- **Email:** basharagb@gmail.com
- **Phone:** +962780853195

**Company:** iDEALCHiP Technology Co.
- **Phone:** +962 79 021 7000
- **Email:** idealchip@idealchip.com
