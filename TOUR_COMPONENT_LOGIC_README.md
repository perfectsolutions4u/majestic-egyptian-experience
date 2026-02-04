# 📋 دليل منطق Tour Component - Logic Documentation

## 🎯 نظرة عامة (Overview)

هذا المكون (`TourComponent`) يعرض قائمة الجولات السياحية مع نظام فلترة متقدم، ترقيم صفحات (Pagination)، ترتيب (Sorting)، وعرض متعدد الأشكال. يستخدم **Server-Side Filtering** حيث يتم إرسال الفلاتر إلى الـ API مباشرة.

---

## 📦 المتطلبات الأساسية (Prerequisites)

### 1. الخدمات المطلوبة (Required Services)
```typescript
- DataService: للحصول على البيانات من API
  - getTours(queryParams, page): جلب الجولات مع الفلاتر
  - getDestination(): جلب قائمة الوجهات
  - getCategories(): جلب قائمة الفئات
  - getToursDuration(): جلب قائمة المدد

- SeoService: لتحديث بيانات SEO
- ActivatedRoute: لقراءة query parameters من URL
- Router: لتحديث URL عند تغيير الفلاتر
```

### 2. المكتبات المطلوبة (Required Libraries)
```typescript
- @angular/material: للـ Radio Buttons, Slider, Checkbox, Badge
- ngx-pagination: للترقيم
- @ngx-translate/core: للترجمة
```

---

## 🔄 الخطوات الأساسية للتنفيذ (Implementation Steps)

### **الخطوة 1: تهيئة المتغيرات (Variables Initialization)**

#### أ) متغيرات الترقيم (Pagination Variables)
```typescript
itemsPerPage: number = 15;        // عدد العناصر في كل صفحة
currentPage: number = 1;          // الصفحة الحالية
totalItems: number = 0;           // إجمالي العناصر من API
allToursCount: number = 0;        // إجمالي الجولات قبل الفلترة
```

#### ب) متغيرات الفلاتر (Filter Variables)
```typescript
// IDs (للاستخدام الداخلي)
selectedDestination: number | null = null;
selectedTripType: number | null = null;
selectedDuration: number | null = null;

// Slugs (للاستخدام في URL والـ API)
selectedDestinationSlug: string | null = '';
selectedCategorySlug: string | null = '';
selectedDurationSlug: string | null = '';

// نطاق السعر
minBudget = 0;
maxBudget = 5000;
```

#### ج) متغيرات البيانات (Data Variables)
```typescript
allCategories: any[] = [];        // جميع الفئات
allDestinations: any[] = [];      // جميع الوجهات
allDurations: any[] = [];         // جميع المدد
allTours: any[] = [];             // الجولات من API
filteredTours: any[] = [];        // الجولات المعروضة (بعد الترتيب)
```

#### د) متغيرات الواجهة (UI Variables)
```typescript
layoutType: 'grid' | 'list' = 'grid';  // نوع العرض

// حالات فتح/إغلاق الفلاتر (Accordion)
isCategoryCollapsed: boolean = false;   // مفتوح افتراضياً
isPriceCollapsed: boolean = true;
isDurationCollapsed: boolean = true;
isDestinationCollapsed: boolean = true;
```

---

### **الخطوة 2: دورة الحياة - ngOnInit()**

#### التدفق الكامل:
```
1. تحديث SEO
2. جلب البيانات الأساسية (الجولات، الوجهات، الفئات، المدد)
3. الاشتراك في queryParams لقراءة الفلاتر من URL
```

#### الكود:
```typescript
ngOnInit(): void {
  // 1. تحديث SEO
  this.seoService.updateSeoData({}, 'Title', 'Description', 'Image');
  
  // 2. جلب البيانات
  this.getAllTours();
  this.getDestination();
  this.getCategories();
  this.getDurations();
  
  // 3. قراءة الفلاتر من URL
  this._ActivatedRoute.queryParams.subscribe((param) => {
    // معالجة الفلاتر من URL (سيتم شرحها بالتفصيل)
    this.getAllTours();
  });
}
```

---

### **الخطوة 3: قراءة الفلاتر من URL (Reading Filters from URL)**

#### المبدأ:
- الـ URL يستخدم **Slugs** بدلاً من IDs (لتحسين SEO)
- مثال: `/tours?destination=cairo&type=adventure&duration=3-days`

#### معالجة الوجهة (Destination):
```typescript
if (param['destination']) {
  // حفظ الـ slug
  this.selectedDestinationSlug = param['destination'];
  
  // البحث عن الـ ID المقابل
  const destination = this.allDestinations.find(
    (dest) => dest.slug === param['destination']
  );
  
  if (destination) {
    this.selectedDestination = destination.id;
  } else {
    // إذا لم يتم تحميل الوجهات بعد، سيتم الحل لاحقاً
    this.selectedDestination = null;
  }
}
```

#### معالجة الفئة (Category):
```typescript
if (param['type']) {
  this.selectedCategorySlug = param['type'];
  const category = this.allCategories.find(
    (cat) => cat.slug === param['type']
  );
  if (category) {
    this.selectedTripType = category.id;
  }
}
```

#### معالجة المدة (Duration):
```typescript
if (param['duration']) {
  const durationParam = param['duration'];
  const isNumeric = !isNaN(Number(durationParam));
  
  if (isNumeric) {
    // دعم التنسيق القديم (ID)
    this.selectedDuration = Number(durationParam);
    // تحويل ID إلى slug
  } else {
    // التنسيق الجديد (slug)
    this.selectedDurationSlug = durationParam;
    // تحويل slug إلى ID
  }
}
```

---

### **الخطوة 4: جلب البيانات الأساسية (Fetching Base Data)**

#### أ) جلب الوجهات (getDestination):
```typescript
getDestination() {
  this._DataService.getDestination().subscribe({
    next: (res) => {
      this.allDestinations = res.data.data;
      
      // إذا كان هناك slug محدد من URL ولم يتم تحميل الوجهات بعد
      if (this.selectedDestinationSlug && this.selectedDestination === null) {
        const destination = this.allDestinations.find(
          (dest) => dest.slug === this.selectedDestinationSlug
        );
        if (destination) {
          this.selectedDestination = destination.id;
          this.getAllTours(); // إعادة جلب الجولات
        }
      }
    }
  });
}
```

#### ب) جلب الفئات (getCategories):
```typescript
getCategories() {
  this._DataService.getCategories().subscribe({
    next: (res) => {
      this.allCategories = res.data.data;
      
      // حل slug إلى ID إذا كان محدداً قبل تحميل الفئات
      if (this.selectedCategorySlug && this.selectedTripType === null) {
        const category = this.allCategories.find(
          (cat) => cat.slug === this.selectedCategorySlug
        );
        if (category) {
          this.selectedTripType = category.id;
          this.getAllTours();
        }
      }
    }
  });
}
```

#### ج) جلب المدد (getDurations):
```typescript
getDurations() {
  this._DataService.getToursDuration().subscribe({
    next: (res) => {
      this.allDurations = res.data;
      
      // نفس منطق حل slug إلى ID
      if (this.selectedDurationSlug && this.selectedDuration === null) {
        const duration = this.allDurations.find(
          (dur) => dur.slug === this.selectedDurationSlug
        );
        if (duration) {
          this.selectedDuration = duration.id;
          this.getAllTours();
        }
      }
    }
  });
}
```

---

### **الخطوة 5: جلب الجولات مع الفلاتر (getAllTours)**

#### المبدأ:
- **Server-Side Filtering**: إرسال الفلاتر إلى API
- استخدام **Slugs** في الـ query parameters
- معالجة استجابة الـ API (Pagination data)

#### الكود:
```typescript
getAllTours(page: number = 1) {
  // بناء query parameters مع slugs
  const queryParams: any = {
    category_slug: this.selectedCategorySlug || '',
    destination_slug: this.selectedDestinationSlug || '',
    duration_slug: this.selectedDurationSlug || '',
  };

  // استدعاء API
  this._DataService.getTours(queryParams, page).subscribe({
    next: (res) => {
      // معالجة الاستجابة
      if (res.data && res.data.data) {
        this.allTours = res.data.data;
        
        // حساب totalItems من استجابة API
        if (res.data.total !== undefined) {
          this.totalItems = Number(res.data.total);
        } else if (res.data.last_page && res.data.per_page) {
          // حساب من last_page و per_page
          this.totalItems = Number(res.data.last_page) * Number(res.data.per_page);
        } else {
          // افتراض: إذا كان لدينا 15 عنصر، قد يكون هناك المزيد
          this.totalItems = res.data.data.length >= 15 
            ? res.data.data.length + 1 
            : res.data.data.length;
        }
        
        this.allToursCount = this.totalItems;
      }
      
      // معالجة الجولات: إضافة destinationsTitle
      this.allTours.forEach((tour) => {
        tour.destinationsTitle = tour.destinations
          ?.map((x: any) => x.title)
          .join(', ');
      });
      
      this.filteredTours = [...this.allTours];
      this.currentPage = page;
    },
    error: (err) => {
      // معالجة الأخطاء
      this.allTours = [];
      this.filteredTours = [];
      this.totalItems = 0;
    }
  });
}
```

---

### **الخطوة 6: معالجة تغيير الفلاتر (onRadioChange)**

#### المبدأ:
- عند تغيير أي فلتر (Category, Destination, Duration):
  1. تحديث القيمة المحددة (ID)
  2. تحويل ID إلى Slug
  3. إعادة جلب الجولات من API
  4. تحديث URL

#### الكود:
```typescript
onRadioChange(
  key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
  value: number | null
) {
  // 1. تحديث القيمة
  this[key] = value;

  // 2. تحويل ID إلى Slug
  if (key === 'selectedTripType') {
    if (value !== null) {
      const category = this.allCategories.find((cat) => cat.id === value);
      this.selectedCategorySlug = category?.slug || null;
    } else {
      this.selectedCategorySlug = null;
    }
  } 
  // نفس المنطق للوجهات والمدد...

  // 3. إعادة جلب الجولات
  this.getAllTours();
  
  // 4. تحديث URL
  this.updateURL();
}
```

---

### **الخطوة 7: تحديث URL (updateURL)**

#### المبدأ:
- تحديث query parameters في URL عند تغيير الفلاتر
- استخدام Slugs في URL (ليس IDs)
- استخدام `replaceUrl: true` لتجنب إضافة صفحات للـ history

#### الكود:
```typescript
updateURL() {
  const queryParams: any = {};

  // إضافة الفلاتر المحددة فقط
  if (this.selectedDestinationSlug) {
    queryParams['destination'] = this.selectedDestinationSlug;
  }

  if (this.selectedTripType !== null) {
    const category = this.allCategories.find(
      (cat) => cat.id === this.selectedTripType
    );
    if (category && category.slug) {
      queryParams['type'] = category.slug;
    }
  }

  if (this.selectedDurationSlug) {
    queryParams['duration'] = this.selectedDurationSlug;
  }

  // تحديث URL
  this._Router.navigate([], {
    relativeTo: this._ActivatedRoute,
    queryParams: queryParams,
    queryParamsHandling: '',  // استبدال جميع الـ params
    replaceUrl: true,          // عدم إضافة للـ history
  });
}
```

---

### **الخطوة 8: الترقيم (Pagination)**

#### أ) تغيير الصفحة (onPageChange):
```typescript
onPageChange(page: number): void {
  // جلب الجولات للصفحة الجديدة مع الحفاظ على الفلاتر الحالية
  this.getAllTours(page);
}
```

#### ب) في الـ Template:
```html
<app-pagination
  [currentPage]="currentPage"
  [itemsPerPage]="itemsPerPage"
  [totalItems]="totalItems"
  (pageChanged)="onPageChange($event)"
></app-pagination>
```

---

### **الخطوة 9: الترتيب (Sorting)**

#### المبدأ:
- **Client-Side Sorting**: الترتيب يتم على `filteredTours` محلياً
- لا يتم إرسال طلب جديد للـ API

#### الكود:
```typescript
onSortChange(event: Event) {
  const sortBy = (event.target as HTMLSelectElement).value;

  switch (sortBy) {
    case 'recent':
      this.sortByRecent();        // حسب ID (الأحدث أولاً)
      break;
    case 'bestseller':
      this.sortByBestSeller();    // حسب display_order
      break;
    case 'priceLowToHigh':
      this.sortByPriceAsc();      // حسب start_from (تصاعدي)
      break;
    case 'priceHighToLow':
      this.sortByPriceDesc();     // حسب start_from (تنازلي)
      break;
  }
}

sortByRecent() {
  this.filteredTours = [...this.filteredTours].sort((a, b) => b.id - a.id);
}

sortByPriceAsc() {
  this.filteredTours = [...this.filteredTours].sort(
    (a, b) => (a.start_from || 0) - (b.start_from || 0)
  );
}
// ... باقي دوال الترتيب
```

---

### **الخطوة 10: Accordion للفلاتر (toggleCollapse)**

#### المبدأ:
- عند فتح قسم، يتم إغلاق باقي الأقسام
- قسم واحد فقط مفتوح في كل مرة

#### الكود:
```typescript
toggleCollapse(section: 'category' | 'price' | 'duration' | 'destination') {
  // إغلاق جميع الأقسام أولاً
  this.isCategoryCollapsed = true;
  this.isPriceCollapsed = true;
  this.isDurationCollapsed = true;
  this.isDestinationCollapsed = true;

  // فتح القسم المحدد فقط
  switch (section) {
    case 'category':
      this.isCategoryCollapsed = !this.isCategoryCollapsed;
      break;
    // ... باقي الأقسام
  }
}
```

---

### **الخطوة 11: مسح جميع الفلاتر (clearAllFilters)**

#### الكود:
```typescript
clearAllFilters() {
  // إعادة تعيين جميع الفلاتر
  this.selectedTripType = null;
  this.selectedDestination = null;
  this.selectedDuration = null;
  this.selectedCategorySlug = null;
  this.selectedDestinationSlug = null;
  this.selectedDurationSlug = null;
  this.minBudget = 0;
  this.maxBudget = 5000;
  
  // إعادة جلب الجولات
  this.getAllTours();
  
  // تحديث URL
  this.updateURL();
}
```

---

### **الخطوة 12: تغيير نوع العرض (setLayout)**

#### الكود:
```typescript
setLayout(type: 'grid' | 'list') {
  this.layoutType = type;
}
```

#### في الـ Template:
```html
<div [ngClass]="layoutType === 'grid' ? 'col-xl-4 col-md-6' : 'col-12'">
  <app-tour-cart [tour]="tour" [layoutType]="layoutType"></app-tour-cart>
</div>
```

---

## 🔄 تدفق البيانات الكامل (Complete Data Flow)

```
1. ngOnInit()
   ├─> getAllTours() → API (بدون فلاتر)
   ├─> getDestination() → API
   ├─> getCategories() → API
   ├─> getDurations() → API
   └─> subscribe to queryParams
       └─> قراءة الفلاتر من URL
           └─> getAllTours() → API (مع فلاتر)

2. User يغير فلتر
   ├─> onRadioChange()
   │   ├─> تحديث ID و Slug
   │   ├─> getAllTours() → API (مع فلاتر جديدة)
   │   └─> updateURL() → تحديث URL

3. User يغير الصفحة
   └─> onPageChange(page)
       └─> getAllTours(page) → API (نفس الفلاتر، صفحة جديدة)

4. User يغير الترتيب
   └─> onSortChange()
       └─> sortByX() → ترتيب محلي على filteredTours
```

---

## 📝 ملاحظات مهمة (Important Notes)

### 1. **Server-Side vs Client-Side Filtering**
- ✅ **الفلاتر الأساسية** (Category, Destination, Duration): **Server-Side**
- ✅ **الترتيب** (Sorting): **Client-Side**
- ⚠️ **فلتر السعر**: حالياً غير مفعل (filterTours() فارغة)

### 2. **Slugs vs IDs**
- **URL**: يستخدم Slugs (SEO-friendly)
- **API**: يرسل Slugs
- **Internal Logic**: يستخدم IDs للربط مع البيانات المحلية

### 3. **Pagination**
- يتم من الـ API (Server-Side)
- `totalItems` يأتي من استجابة API
- إذا لم يكن متوفراً، يتم حسابه من `last_page` و `per_page`

### 4. **Backward Compatibility**
- يدعم التنسيق القديم (IDs في URL) والتنسيق الجديد (Slugs)
- مثال: `?duration=3` (ID) و `?duration=3-days` (Slug)

---

## 🎨 هيكل الـ Template (Template Structure)

```
1. Banner Component
2. Sidebar (الفلاتر)
   ├─ Category Filter (Accordion)
   ├─ Price Filter (Accordion + Slider)
   ├─ Duration Filter (Accordion)
   └─ Destination Filter (Accordion)

3. Main Content
   ├─ Header (عدد النتائج + Clear Filters + Layout Toggle + Sort)
   ├─ Tours Grid/List
   │   └─ Tour Cart Component (مع layoutType)
   └─ Pagination Component (إذا totalItems > 15)
```

---

## 🔧 كيفية التطبيق في مشروع جديد (How to Apply in New Project)

### الخطوات:

1. **نسخ المكون**:
   - `tour.component.ts`
   - `tour.component.html`
   - `tour.component.scss`

2. **تأكد من وجود الخدمات**:
   - `DataService` مع methods: `getTours()`, `getDestination()`, `getCategories()`, `getToursDuration()`
   - `SeoService`

3. **تثبيت المكتبات**:
   ```bash
   npm install @angular/material ngx-pagination @ngx-translate/core
   ```

4. **تعديل الـ API Endpoints**:
   - تأكد من أن API يدعم:
     - `category_slug`, `destination_slug`, `duration_slug` في query params
     - Pagination: `page` parameter
     - Response structure: `{ data: { data: [], total: number } }`

5. **تعديل أسماء المتغيرات**:
   - استبدل `tour` بـ اسم كيانك (مثلاً: `product`, `item`)
   - استبدل `destination` بـ اسم الفلتر الخاص بك

6. **اختبار التدفق**:
   - افتح الصفحة بدون فلاتر
   - جرب كل فلتر على حدة
   - جرب الترقيم
   - جرب الترتيب
   - جرب تغيير URL يدوياً

---

## 🐛 استكشاف الأخطاء (Troubleshooting)

### المشكلة: الفلاتر لا تعمل
- ✅ تأكد من أن API يدعم slugs
- ✅ تأكد من أن `getAllTours()` يتم استدعاؤها بعد تغيير الفلتر

### المشكلة: Pagination لا يظهر
- ✅ تأكد من أن `totalItems > itemsPerPage`
- ✅ تأكد من أن API يرجع `total` في الاستجابة

### المشكلة: URL لا يتحدث
- ✅ تأكد من استدعاء `updateURL()` بعد تغيير الفلتر
- ✅ تأكد من أن `Router` و `ActivatedRoute` مُحقن بشكل صحيح

---

## 📚 المراجع (References)

- Angular Router: https://angular.io/guide/router
- Angular Material: https://material.angular.io/
- ngx-pagination: https://www.npmjs.com/package/ngx-pagination

---

**تم إنشاء هذا الدليل بواسطة AI Assistant**  
**تاريخ الإنشاء: 2024**

