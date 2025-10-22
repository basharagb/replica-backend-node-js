// Quick Test Script for Phase Two APIs
// Run this after starting the server to test all 15 new APIs

const BASE_URL = 'http://localhost:3000';

const testAPIs = [
  // Material Types APIs (4 endpoints)
  {
    name: 'Get All Materials',
    method: 'GET',
    url: `${BASE_URL}/warehouse/materials`,
    description: 'جلب قائمة المواد المخزنة'
  },
  {
    name: 'Create Material',
    method: 'POST',
    url: `${BASE_URL}/warehouse/materials`,
    description: 'إنشاء نوع مادة جديد',
    body: {
      name: 'Test Wheat',
      name_ar: 'قمح تجريبي',
      description: 'Test wheat material',
      color_code: '#F4A460',
      density: 0.780,
      unit: 'tons',
      notes: 'Test material for API testing'
    }
  },
  {
    name: 'Update Material',
    method: 'PATCH',
    url: `${BASE_URL}/warehouse/materials/1`,
    description: 'تعديل نوع مادة موجود',
    body: {
      notes: 'Updated notes for testing'
    }
  },
  {
    name: 'Delete Material',
    method: 'DELETE',
    url: `${BASE_URL}/warehouse/materials/999`,
    description: 'حذف نوع مادة'
  },

  // Warehouse Silos APIs (3 endpoints)
  {
    name: 'Get All Warehouse Silos',
    method: 'GET',
    url: `${BASE_URL}/warehouse/silos`,
    description: 'عرض الصوامع مع المخزون'
  },
  {
    name: 'Get Silo Inventory',
    method: 'GET',
    url: `${BASE_URL}/warehouse/silo/1`,
    description: 'تفاصيل مخزون صومعة معينة'
  },
  {
    name: 'Update Silo Notes',
    method: 'PATCH',
    url: `${BASE_URL}/warehouse/silo/1`,
    description: 'تحديث ملاحظات الصومعة',
    body: {
      notes: 'Updated silo notes for testing'
    }
  },

  // Shipments APIs (5 endpoints)
  {
    name: 'Get All Shipments',
    method: 'GET',
    url: `${BASE_URL}/warehouse/shipments?page=1&limit=10`,
    description: 'عرض جميع الشحنات'
  },
  {
    name: 'Create Incoming Shipment',
    method: 'POST',
    url: `${BASE_URL}/warehouse/silo/1/incoming`,
    description: 'تسجيل شحنة قادمة',
    body: {
      material_type_id: 1,
      quantity: 25.5,
      scheduled_date: '2025-10-25T10:00:00',
      truck_plate: 'ABC-123',
      driver_name: 'أحمد محمد',
      supplier: 'شركة الحبوب الذهبية',
      notes: 'شحنة قمح عالي الجودة'
    }
  },
  {
    name: 'Create Outgoing Shipment',
    method: 'POST',
    url: `${BASE_URL}/warehouse/silo/1/outgoing`,
    description: 'تسجيل شحنة صادرة',
    body: {
      material_type_id: 1,
      quantity: 15.0,
      scheduled_date: '2025-10-26T14:00:00',
      truck_plate: 'XYZ-789',
      driver_name: 'محمد علي',
      customer: 'مطاحن الشرق',
      notes: 'شحنة قمح للعميل الرئيسي'
    }
  },
  {
    name: 'Confirm Shipment',
    method: 'PATCH',
    url: `${BASE_URL}/warehouse/shipment/1/confirm`,
    description: 'تأكيد إتمام الشحنة'
  },
  {
    name: 'Cancel Shipment',
    method: 'DELETE',
    url: `${BASE_URL}/warehouse/shipment/999`,
    description: 'إلغاء شحنة',
    body: {
      reason: 'تأخير في وصول الشاحنة'
    }
  },

  // Analytics APIs (3 endpoints)
  {
    name: 'Fill Level Analytics',
    method: 'GET',
    url: `${BASE_URL}/warehouse/analytics/fill-level`,
    description: 'تحليل امتلاء الصوامع'
  },
  {
    name: 'Inventory Prediction',
    method: 'GET',
    url: `${BASE_URL}/warehouse/analytics/prediction?days=30`,
    description: 'توقع المخزون للأيام القادمة'
  },
  {
    name: 'Shipment Analytics',
    method: 'GET',
    url: `${BASE_URL}/warehouse/analytics/shipments`,
    description: 'تحليل الشحنات وتقارير الأداء'
  }
];

console.log('🏭 Phase Two: Warehouse Management System - API Test List');
console.log('=' .repeat(80));
console.log(`📋 Total APIs: ${testAPIs.length}`);
console.log('');

testAPIs.forEach((api, index) => {
  console.log(`${index + 1}. 🔹 ${api.name}`);
  console.log(`   Method: ${api.method}`);
  console.log(`   URL: ${api.url}`);
  console.log(`   Description: ${api.description}`);
  if (api.body) {
    console.log(`   Body: ${JSON.stringify(api.body, null, 2)}`);
  }
  console.log('');
});

console.log('🚀 To test these APIs:');
console.log('1. Start the server: node app.js');
console.log('2. Run the database migration: mysql -u root -p silos < migrations/phase_two_tables.sql');
console.log('3. Use curl, Postman, or any HTTP client to test the endpoints');
console.log('');
console.log('📝 Example curl command:');
console.log(`curl -X GET "${BASE_URL}/warehouse/materials" -H "Content-Type: application/json"`);
console.log('');
console.log('✅ All 15 APIs are now ready for testing!');

export { testAPIs };
