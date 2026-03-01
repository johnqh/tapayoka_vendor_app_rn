# Vendor App UX Implementation Plan

## Context

The tapayoka vendor app needs a complete vendor management UX: locations, equipment categories, services, service controls, and equipment. The existing `devices`/`services`/`device_services` data model is being **replaced** with a new vendor-centric schema. Implementation is phased across 4 projects in dependency order, with build/deploy pauses between each phase.

### Key Decisions (from clarifications)
- `vendor_services` has FK to both `vendor_locations` and `vendor_equipment_categories`, with UNIQUE on (location_id, category_id)
- `firebaseUserId` stored as a plain string (not FK to users table) on `vendor_locations` and `vendor_equipment_categories`
- `vendor_equipments` FK points to `vendor_services` (not `vendor_service_controls`) -- they are independent
- `vendor_equipments` uses wallet_address as PK
- `vendor_service_controls` pin_number range: 1-5, no unique constraint on (service_id, pin_number)
- Deleting a service cascade-deletes its service_controls
- Bottom tabs: Locations, Categories, Orders, Settings
- Existing types/endpoints kept (buyer flow still uses them); new vendor endpoints use `/vendor-services` path to avoid collision

---

## Phase 1: Types (`tapayoka_types`)

**File:** `/Users/johnhuang/projects/tapayoka_types/src/index.ts`

### 1.1 Domain Models

```typescript
VendorLocation { id, firebaseUserId, name, address, city, stateProvince, zipcode, country, createdAt, updatedAt }
VendorEquipmentCategory { id, firebaseUserId, name, createdAt, updatedAt }
VendorService { id, vendorLocationId, vendorEquipmentCategoryId, name, price (string - numeric from PG), currencyCode, createdAt, updatedAt }
VendorServiceControl { id, vendorServiceId, pinNumber, duration }
VendorEquipment { walletAddress (PK), vendorServiceId, name, createdAt, updatedAt }
```

### 1.2 Request Types

| Entity | Create Request | Update Request |
|--------|---------------|----------------|
| VendorLocation | name, address, city, stateProvince, zipcode, country | all optional |
| VendorEquipmentCategory | name | name? |
| VendorService | vendorLocationId, vendorEquipmentCategoryId, name, price, currencyCode? | all optional |
| VendorServiceControl | vendorServiceId, pinNumber, duration | pinNumber?, duration? |
| VendorEquipment | walletAddress, vendorServiceId, name | name?, vendorServiceId? |

### 1.3 Response Type Aliases

Add `BaseResponse<T>` wrappers: `VendorLocationListResponse`, `VendorLocationResponse`, etc. for all 5 entities (10 total).

### 1.4 Do NOT remove existing types

Existing `Device`, `Service`, `DeviceService` types stay -- buyer flow depends on them.

**After:** publish package, bump version in `tapayoka_api` and `tapayoka_client`.

---

## Phase 2: API + Client Library

### 2A: Backend API (`tapayoka_api`)

#### 2A.1 Database Schema (`src/db/schema.ts`)

Add 5 new Drizzle tables (order matters for FK references):

1. `vendor_locations` -- id(UUID PK), firebase_user_id(varchar 128, indexed), name, address, city, state_province, zipcode, country, created_at, updated_at
2. `vendor_equipment_categories` -- id(UUID PK), firebase_user_id(varchar 128, indexed), name, created_at, updated_at
3. `vendor_services` -- id(UUID PK), vendor_location_id(FK), vendor_equipment_category_id(FK), name, price(numeric 10,2), currency_code(varchar 3, default 'USD'), created_at, updated_at. UNIQUE(vendor_location_id, vendor_equipment_category_id). Indexes on both FKs.
4. `vendor_service_controls` -- id(UUID PK), vendor_service_id(FK, ON DELETE CASCADE), pin_number(int), duration(int). Index on service_id.
5. `vendor_equipments` -- wallet_address(varchar 42 PK), vendor_service_id(FK), name, created_at, updated_at. Index on service_id.

#### 2A.2 DB Init (`src/db/index.ts`)

Add `CREATE TABLE IF NOT EXISTS` SQL for all 5 tables in `initDatabase()`.

#### 2A.3 Zod Schemas (`src/schemas/index.ts`)

Add create/update validation schemas for all 5 entities.

#### 2A.4 New Route Files (`src/routes/vendor/`)

| File | Route Prefix | Endpoints |
|------|-------------|-----------|
| `locations.ts` | `/locations` | GET /, GET /:id, POST /, PUT /:id, DELETE /:id (409 if has services), GET /:id/services |
| `equipmentCategories.ts` | `/equipment-categories` | GET /, GET /:id, POST /, PUT /:id, DELETE /:id (409 if has services), GET /:id/services |
| `vendorServices.ts` | `/vendor-services` | GET /:id, POST /, PUT /:id, DELETE /:id (409 if has equipments; controls cascade) |
| `serviceControls.ts` | `/service-controls` | GET /service/:serviceId, POST /, PUT /:id, DELETE /:id |
| `equipments.ts` | `/equipments` | GET /service/:serviceId, POST /, PUT /:walletAddress, DELETE /:walletAddress |

**Ownership validation:** Every route verifies entity belongs to the authenticated user's `firebaseUid` (direct check for locations/categories; join to parent for services/controls/equipments).

#### 2A.5 Route Registration (`src/routes/index.ts`)

Wire up all 5 new route files under vendorRoutes.

### 2B: Client Library (`tapayoka_client`)

#### 2B.1 TapayokaClient Methods (`src/network/TapayokaClient.ts`)

~24 new methods following existing pattern:

- **Locations (6):** getVendorLocations, getVendorLocation, createVendorLocation, updateVendorLocation, deleteVendorLocation, getVendorLocationServices
- **Categories (6):** getVendorEquipmentCategories, getVendorEquipmentCategory, createVendorEquipmentCategory, updateVendorEquipmentCategory, deleteVendorEquipmentCategory, getVendorEquipmentCategoryServices
- **Services (4):** getVendorService, createVendorService, updateVendorService, deleteVendorService
- **Controls (4):** getVendorServiceControls, createVendorServiceControl, updateVendorServiceControl, deleteVendorServiceControl
- **Equipments (4):** getVendorEquipments, createVendorEquipment, updateVendorEquipment, deleteVendorEquipment

#### 2B.2 React Hooks (`src/hooks/`)

5 new hooks following `useDevices.ts` pattern:
- `useVendorLocations.ts`
- `useVendorEquipmentCategories.ts`
- `useVendorServices.ts` (takes parentId + parentType 'location'|'category')
- `useVendorServiceControls.ts` (scoped by serviceId)
- `useVendorEquipments.ts` (scoped by serviceId)

#### 2B.3 Barrel Exports

Update `src/hooks/index.ts` and add query keys to `src/types.ts`.

**After:** publish client, deploy API, bump versions in `tapayoka_lib`.

---

## Phase 3: Business Logic Library (`tapayoka_lib`)

### 3.1 Zustand Stores (`src/business/stores/`)

5 new stores following `useDevicesStore.ts` pattern:
- `useVendorLocationsStore.ts` -- { locations[], isLoaded, set/add/update/remove/reset }
- `useVendorEquipmentCategoriesStore.ts` -- { categories[], isLoaded, ... }
- `useVendorServicesStore.ts` -- { services[], isLoaded, parentId, ... }
- `useVendorServiceControlsStore.ts` -- { controls[], isLoaded, serviceId, ... }
- `useVendorEquipmentsStore.ts` -- { equipments[], isLoaded, serviceId, ... }

### 3.2 Manager Hooks (`src/business/hooks/`)

5 new managers following `useDevicesManager.ts` pattern:
- `useVendorLocationsManager.ts`
- `useVendorEquipmentCategoriesManager.ts`
- `useVendorServicesManager.ts` (takes parentId/parentType)
- `useVendorServiceControlsManager.ts` (takes serviceId)
- `useVendorEquipmentsManager.ts` (takes serviceId)

### 3.3 Barrel Exports

Update `src/business/stores/index.ts` and `src/business/hooks/index.ts`.

**After:** publish lib, bump version in `tapayoka_vendor_app_rn`.

---

## Phase 4: Vendor App UX (`tapayoka_vendor_app_rn`)

### 4.1 Navigation Architecture

```
BottomTabs
  |-- Locations (NativeStack)
  |     |-- LocationsListScreen
  |     |-- LocationServicesScreen
  |     |-- ServiceDetailScreen
  |
  |-- Categories (NativeStack)
  |     |-- CategoriesListScreen
  |     |-- CategoryServicesScreen
  |     |-- ServiceDetailScreen (same component)
  |
  |-- Orders (existing)
  |-- Settings (existing)
```

**Files to create:**

| # | File | Purpose |
|---|------|---------|
| 1 | `src/navigation/types.ts` | LocationsStackParamList, CategoriesStackParamList |
| 2 | `src/screens/locations/LocationsListScreen.tsx` | FlatList of locations, add/edit/delete |
| 3 | `src/screens/locations/LocationFormModal.tsx` | Form: name, address, city, stateProvince, zipcode, country |
| 4 | `src/screens/categories/CategoriesListScreen.tsx` | FlatList of categories, add/edit/delete |
| 5 | `src/screens/categories/CategoryFormModal.tsx` | Form: name |
| 6 | `src/screens/services/LocationServicesScreen.tsx` | Services for a location; create/edit picks category from dropdown |
| 7 | `src/screens/services/CategoryServicesScreen.tsx` | Services for a category; create/edit picks location from dropdown |
| 8 | `src/screens/services/ServiceDetailScreen.tsx` | Service info + two independent sections: controls & equipment |
| 9 | `src/screens/services/ServiceFormModal.tsx` | Form: name, price, currencyCode, picker for location or category |
| 10 | `src/screens/services/ServiceControlForm.tsx` | Inline/modal: pinNumber (1-5), duration (seconds) |
| 11 | `src/screens/services/EquipmentForm.tsx` | Form: name, auto-generated EVM wallet address |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/navigation/AppNavigator.tsx` | Replace 3-tab (Devices, Orders, Settings) with 4-tab (Locations, Categories, Orders, Settings); nest NativeStacks in Locations and Categories |
| `src/config/constants.ts` | Update TAB_NAMES |
| `src/i18n/index.ts` | Add translation keys for all new screens |

### 4.2 Screen Details

**LocationsListScreen:** FlatList with pull-to-refresh. Each row: name, city/state/country. Swipe or long-press to delete (Alert confirmation; show error if 409). FAB or header "+" to add. Tap row -> LocationServicesScreen.

**CategoriesListScreen:** Same pattern, simpler row (just name).

**LocationServicesScreen:** Receives locationId via nav params. Lists services with name, price, currency, category name. "Add" opens ServiceFormModal with location pre-selected, user picks category. Tap row -> ServiceDetailScreen.

**CategoryServicesScreen:** Mirror of above. Receives categoryId. "Add" has category pre-selected, user picks location.

**ServiceDetailScreen:** Header with service info (name, price, location, category). Two collapsible/tab sections:
- **Controls:** List of pin_number + duration. Add/edit/delete inline.
- **Equipment:** List of name + wallet address. "Add" auto-generates `0x` + 40 random hex chars. Edit/delete.

### 4.3 EVM Wallet Address Generation

```typescript
const generateWalletAddress = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### 4.4 Delete Protection UX

| Entity | Condition | Behavior |
|--------|-----------|----------|
| Location | Has services | Alert: "Cannot delete location with associated services. Remove services first." |
| Category | Has services | Alert: "Cannot delete category with associated services. Remove services first." |
| Service | Has equipments | Alert: "Cannot delete service with associated equipment. Remove equipment first." |
| Service | Has controls only | Allowed (controls cascade-delete) |
| Control | Always | Allowed |
| Equipment | Always | Allowed |

---

## Verification Plan

### Phase 1
- `cd tapayoka_types && bun run verify && bun run build`

### Phase 2
- API: `cd tapayoka_api && bun run dev`, test all endpoints with curl/Postman
- Client: `cd tapayoka_client && bun run verify && bun run build`
- Test CRUD flow: create location -> create category -> create service -> create control -> create equipment
- Test delete protection: try deleting location/category/service with children -> expect 409
- Test cascade: delete service with controls -> controls auto-deleted

### Phase 3
- `cd tapayoka_lib && bun run verify && bun run build`

### Phase 4
- `cd tapayoka_vendor_app_rn && npx expo start`
- Test full navigation flow: Locations tab -> add location -> tap location -> add service (pick category) -> tap service -> add control + add equipment
- Test from Categories tab: add category -> tap category -> add service (pick location) -> tap service -> manage controls & equipment
- Test delete protection in UI: try deleting entities with children -> see error alerts
- Test auth: different users see only their own data
