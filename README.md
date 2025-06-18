# Flight Booking Website - Feature-based Architecture

## 🚀 Setup Project

### Prerequisites
- Node.js (version 16 hoặc cao hơn)
- npm hoặc yarn

### Installation
```bash
# Clone project
git clone <repository-url>
cd flight-booking-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Cấu trúc thư mục - Feature-based Architecture

```
src/
├── app/                          # App configuration & providers
│   ├── App.tsx                   # Main App component
│   ├── store/                    # Global state management
│   └── providers/                # Context providers
├── shared/                       # Shared utilities & components
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Basic UI components (Button, Input, etc.)
│   │   └── layout/               # Layout components (Header, Footer)
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utility functions
│   ├── constants/                # App constants
│   ├── types/                    # TypeScript type definitions
│   └── services/                 # API services
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   ├── hooks/                # Auth-specific hooks
│   │   ├── services/             # Auth API calls
│   │   ├── types/                # Auth type definitions
│   │   └── index.ts              # Feature exports
│   ├── flight-search/            # Flight search feature
│   │   ├── components/
│   │   │   ├── FlightSearchForm.tsx
│   │   │   ├── FlightFilters.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFlightSearch.ts
│   │   │   └── useFlightFilters.ts
│   │   ├── services/
│   │   │   └── flightSearchApi.ts
│   │   ├── types/
│   │   │   └── flightSearch.types.ts
│   │   └── index.ts
│   ├── flight-results/           # Flight results feature
│   │   ├── components/
│   │   │   ├── FlightResultsList.tsx
│   │   │   ├── FlightCard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── booking/                  # Booking feature
│   │   ├── components/
│   │   │   ├── BookingFlow.tsx
│   │   │   ├── PassengerForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── BookingConfirmation.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── destinations/             # Popular destinations feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── user-profile/             # User profile feature
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts
├── pages/                        # Page components (if using routing)
│   ├── HomePage.tsx
│   ├── SearchResultsPage.tsx
│   └── BookingPage.tsx
└── assets/                       # Static assets
    ├── images/
    ├── icons/
    └── styles/
```

## 🏗️ Nguyên tắc Feature-based Architecture

### 1. **Feature Independence**
- Mỗi feature là một module độc lập
- Có thể phát triển và test riêng biệt
- Dễ dàng thêm/xóa features

### 2. **Shared Resources**
- Components, hooks, utilities dùng chung được đặt trong `shared/`
- Tránh duplicate code

### 3. **Clear Boundaries**
- Mỗi feature có ranh giới rõ ràng
- Communication giữa features thông qua shared state hoặc props

### 4. **Scalability**
- Dễ dàng mở rộng khi thêm features mới
- Team có thể làm việc parallel trên các features khác nhau

## 🔧 Development Guidelines

### Component Naming Convention
```typescript
// Feature components
FlightSearchForm.tsx
BookingFlow.tsx
PassengerForm.tsx

// Shared UI components
Button.tsx
Input.tsx
Modal.tsx
```

### Import/Export Pattern
```typescript
// features/flight-search/index.ts
export { FlightSearchForm } from './components/FlightSearchForm';
export { useFlightSearch } from './hooks/useFlightSearch';
export type { FlightSearchData } from './types/flightSearch.types';

// Usage in other files
import { FlightSearchForm, useFlightSearch } from '@/features/flight-search';
```

### Custom Hooks Pattern
```typescript
// features/flight-search/hooks/useFlightSearch.ts
export const useFlightSearch = () => {
  const [searchData, setSearchData] = useState();
  const [loading, setLoading] = useState(false);
  
  const searchFlights = async (data: FlightSearchData) => {
    // Implementation
  };
  
  return { searchData, loading, searchFlights };
};
```

## 📦 Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

## 🎨 Styling Guidelines

- Sử dụng Tailwind CSS cho styling
- Ant Design cho complex components
- Dark theme với màu chủ đạo xanh đậm
- Responsive design cho tất cả devices

## 🧪 Testing Strategy

```
src/
├── features/
│   └── flight-search/
│       ├── __tests__/
│       │   ├── FlightSearchForm.test.tsx
│       │   └── useFlightSearch.test.ts
│       └── components/
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Best Practices

1. **Single Responsibility**: Mỗi component/hook chỉ làm một việc
2. **Composition over Inheritance**: Sử dụng composition pattern
3. **Type Safety**: Sử dụng TypeScript cho type safety
4. **Performance**: Lazy loading cho các features lớn
5. **Accessibility**: Tuân thủ WCAG guidelines