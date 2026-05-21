# Component Breakdown

This document provides a detailed breakdown of all key components in the AI Trip Planner application, organized by feature area.

## Component Hierarchy Overview

```
App (Root)
├── Header (Persistent Navigation)
├── Toaster (Global Notifications)
└── Router
    ├── Hero (Landing Page)
    ├── CreateTrip (Trip Generation)
    ├── ViewTrip (Trip Details)
    └── MyTrips (User Dashboard)
```

---

## 1. Core Application Components

### App.jsx
**Location**: [src/App.jsx](../src/App.jsx)

**Role**: Root component of the application

**Responsibilities**:
- Currently renders the Hero component as the landing page
- Serves as the main application wrapper

**Dependencies**:
- Hero component

**Key Features**:
- Simple wrapper component
- Entry point for main content rendering

---

### main.jsx
**Location**: [src/main.jsx](../src/main.jsx)

**Role**: Application entry point and router configuration

**Responsibilities**:
- Initialize React application
- Configure React Router with all routes
- Set up Google OAuth provider
- Add global components (Header, Toaster)
- Mount app to DOM

**Dependencies**:
- React, ReactDOM
- React Router
- GoogleOAuthProvider
- App, Header, CreateTrip, ViewTrip, MyTrips components
- Toaster component

**Routes Configured**:
```javascript
/ → App (Hero landing page)
/create-trip → CreateTrip
/view-trip/:tripId → ViewTrip
/my-trips → MyTrips
```

**Key Features**:
- Wraps entire app with GoogleOAuthProvider using `VITE_GOOGLE_AUTH_CLIENT_ID`
- Header component rendered outside routes (persistent)
- Toaster for global notifications

---

## 2. Navigation & Layout Components

### Header.jsx
**Location**: [src/components/custom/Header.jsx](../src/components/custom/Header.jsx)

**Role**: Global navigation bar

**Responsibilities**:
- Display app logo and branding
- Show user authentication status
- Provide sign-in/sign-out functionality
- Navigate between routes

**State**:
- `user`: Current user data from localStorage
- `openDialog`: Controls auth dialog visibility

**Key Functions**:
```javascript
useEffect() // Load user from localStorage on mount
googleLogout() // Sign out and clear localStorage
```

**Dependencies**:
- Button component (UI)
- useGoogleLogin (OAuth)
- Popover (UI dropdown)
- React Router navigation

**Interactions**:
- Reads user data from localStorage
- Triggers Google OAuth dialog when not authenticated
- Navigates to `/create-trip` and `/my-trips`

**UI Elements**:
- Logo image (clickable, navigates home)
- "Get Started" button (→ /create-trip)
- "My Trips" button (→ /my-trips, only when authenticated)
- User profile dropdown (shows user email, picture, sign out)

---

## 3. Landing Page Components

### Hero.jsx
**Location**: [src/components/custom/Hero.jsx](../src/components/custom/Hero.jsx)

**Role**: Landing page / homepage

**Responsibilities**:
- Display marketing copy and value proposition
- Provide call-to-action button
- Show visual appeal of the app

**Key Features**:
- Hero headline: "Discover Your Next Adventure with AI"
- Subheadline: Explains AI-powered personalized itineraries
- CTA button: "Get Started, It's Free" (→ /create-trip)
- Background image of travel destination

**Dependencies**:
- Button component (UI)
- React Router Link

**Styling**:
- Full-height viewport layout
- Responsive flex layout
- Background image with overlay
- TailwindCSS utilities

---

## 4. Trip Creation Components

### CreateTrip (index.jsx)
**Location**: [src/create-trip/index.jsx](../src/create-trip/index.jsx)

**Role**: Main trip creation form and orchestration

**Responsibilities**:
- Collect user trip preferences
- Validate input data
- Generate AI prompt
- Call Gemini AI API
- Save trip to Firestore
- Navigate to trip view page

**State**:
```javascript
place // Selected destination (Google Places object)
formData // {noOfDays, location, budget, traveler}
openDialog // Auth dialog visibility
loading // API call loading state
```

**Key Functions**:

#### `handleInputChange(name, value)`
Updates form data state with user input

#### `OnGenerateTrip()`
Main trip generation workflow:
1. Check user authentication
2. Validate form data
3. Build AI prompt
4. Call Gemini AI
5. Parse JSON response
6. Save to Firestore
7. Navigate to view page

#### `SaveAiTrip(TripData)`
Saves trip to Firestore:
```javascript
db.collection("AiTrips").doc(Date.now().toString()).set({
  userSelection: formData,
  tripData: TripData,
  userEmail: user?.email,
  id: Date.now().toString()
})
```

#### `login()`
Handles Google OAuth flow and user profile retrieval

#### `GetUserProfile(tokenInfo)`
Fetches user data from Google OAuth API

**Dependencies**:
- GooglePlacesAutocomplete
- Input component (UI)
- Button component (UI)
- Dialog component (UI)
- Gemini AI service
- Firebase Firestore
- Google OAuth

**Form Fields**:
1. **Destination** (required):
   - Google Places Autocomplete
   - Updates both `place` and `formData.location`

2. **Trip Duration** (required):
   - Number input (1-5 days max)
   - Updates `formData.noOfDays`

3. **Budget** (required):
   - Three card options: Cheap, Moderate, Luxury
   - Updates `formData.budget`
   - Visual card selection UI

4. **Travelers** (required):
   - Four card options: Just Me (1), Couple (2), Family (3+), Friends (5+)
   - Updates `formData.traveler`
   - Visual card selection UI

**Validation**:
- All fields must be filled
- Maximum 5 days allowed
- Shows toast notifications for errors

**AI Prompt Construction**:
```javascript
AI_PROMPT
  .replace('{location}', formData?.location?.label)
  .replace('{totalDays}', formData?.noOfDays)
  .replace('{traveler}', formData?.traveler)
  .replace('{budget}', formData?.budget)
  .replace('{totalDays}', formData?.noOfDays)
```

---

## 5. Trip Viewing Components

### ViewTrip (index.jsx)
**Location**: [src/view-trip/[tripId]/index.jsx](../src/view-trip/[tripId]/index.jsx)

**Role**: Display complete trip details

**Responsibilities**:
- Fetch trip data from Firestore using tripId param
- Render trip information sections
- Display hotels and itinerary

**State**:
```javascript
trip // Complete trip data from Firestore
```

**Key Functions**:

#### `GetTripData()`
Fetches trip from Firestore:
```javascript
const docRef = doc(db, 'AiTrips', tripId)
const docSnap = await getDoc(docRef)
setTrip(docSnap.data())
```

**Layout Structure**:
```
<div className="p-10 md:px-20 lg:px-44 xl:px-56">
  <InfoSection trip={trip} />
  <Hotels trip={trip} />
  <TripPlace trip={trip} />
  <Footer />
</div>
```

**Dependencies**:
- InfoSection
- Hotels
- TripPlace
- Footer
- Firebase Firestore
- React Router (tripId param)

---

### InfoSection.jsx
**Location**: [src/view-trip/components/InfoSection.jsx](../src/view-trip/components/InfoSection.jsx)

**Role**: Display trip header with location photo and key details

**Responsibilities**:
- Fetch and display location photo
- Show trip metadata (days, budget, travelers)
- Provide visual header for trip page

**Props**:
```javascript
trip // {userSelection: {location, noOfDays, budget, traveler}, tripData: {...}}
```

**State**:
```javascript
photoUrl // URL for location photo from Google Places
```

**Key Functions**:

#### `GetPlacePhoto()`
1. Call `GetPlaceDetails(trip?.userSelection?.location?.label)`
2. Extract photo reference from response
3. Build photo URL using `PHOTO_REF_URL`
4. Set `photoUrl` state

**UI Elements**:
- Large banner image (location photo)
- Trip title (destination name)
- Information badges:
  - 📅 Days (e.g., "3 Day")
  - 💰 Budget (e.g., "Moderate")
  - 🥂 Travelers (e.g., "2 People")

**Dependencies**:
- GlobalApi (GetPlaceDetails, PHOTO_REF_URL)
- Google Places API

---

### Hotels.jsx
**Location**: [src/view-trip/components/Hotels.jsx](../src/view-trip/components/Hotels.jsx)

**Role**: Display list of recommended hotels

**Responsibilities**:
- Map through hotel options from trip data
- Render HotelCardItem for each hotel
- Provide hotels section header

**Props**:
```javascript
trip // {tripData: {hotelOptions: [...]}}
```

**Layout**:
- Section header: "Hotel Recommendation"
- Grid layout: responsive columns (1 on mobile, 2 on md, 3 on lg)
- Maps `trip?.tripData?.hotelOptions`

**Dependencies**:
- HotelCardItem

---

### HotelCardItem.jsx
**Location**: [src/view-trip/components/HotelCardItem.jsx](../src/view-trip/components/HotelCardItem.jsx)

**Role**: Display individual hotel card

**Responsibilities**:
- Fetch hotel photo from Google Places
- Display hotel details
- Provide link to Google Maps

**Props**:
```javascript
hotel // {hotelName, hotelAddress, price, rating, description}
```

**State**:
```javascript
photoUrl // Hotel photo from Google Places
```

**Key Functions**:

#### `GetPlacePhoto()`
Same as InfoSection - fetches photo for hotel name

**UI Elements**:
- Hotel photo (600x600px)
- Hotel name
- Hotel address
- Price range (💰 icons)
- Star rating (⭐ icons)
- Description text
- "View on Google Maps" link

**Interactions**:
- Opens Google Maps in new tab with hotel name query
- URL format: `https://www.google.com/maps/search/?api=1&query={hotelName}`

**Dependencies**:
- GlobalApi
- React Icons (FaMapLocationDot)

---

### TripPlace.jsx
**Location**: [src/view-trip/components/TripPlace.jsx](../src/view-trip/components/TripPlace.jsx)

**Role**: Display day-by-day itinerary

**Responsibilities**:
- Map through each day in itinerary
- Display day headers
- Render PlaceCardItem for each activity

**Props**:
```javascript
trip // {tripData: {itinerary: [{day: "Day 1", plan: [...]}]}}
```

**Layout Structure**:
```
Section Header: "Places to Visit"
For each day in itinerary:
  <h2>Day {day}</h2>
  <div className="grid grid-cols-2">
    For each place in day.plan:
      <PlaceCardItem place={place} />
```

**Dependencies**:
- PlaceCardItem

---

### PlaceCardItem.jsx
**Location**: [src/view-trip/components/PlaceCardItem.jsx](../src/view-trip/components/PlaceCardItem.jsx)

**Role**: Display individual place/activity card

**Responsibilities**:
- Fetch place photo from Google Places
- Display place details (name, details, time, ticket pricing)
- Provide link to Google Maps

**Props**:
```javascript
place // {placeName, placeDetails, timeTravel, ticketPricing}
```

**State**:
```javascript
photoUrl // Place photo from Google Places
```

**Key Functions**:

#### `GetPlacePhoto()`
Fetches photo for place name

**UI Elements**:
- Place photo (600x600px)
- Place name (bold)
- Place details (description)
- Time to travel (🕒 icon)
- Ticket pricing (💵 icon)
- "View on Google Maps" link

**Interactions**:
- Opens Google Maps in new tab with place name query

**Dependencies**:
- GlobalApi
- React Icons (FaMapLocationDot)

---

### Footer.jsx
**Location**: [src/view-trip/components/Footer.jsx](../src/view-trip/components/Footer.jsx)

**Role**: Display footer at bottom of trip page

**Responsibilities**:
- Show app branding
- Provide copyright information

**UI Elements**:
- App logo
- Copyright text: "© 2024 All rights reserved"

---

## 6. User Dashboard Components

### MyTrips (index.jsx)
**Location**: [src/my-trips/index.jsx](../src/my-trips/index.jsx)

**Role**: Display all trips for logged-in user

**Responsibilities**:
- Fetch user's trips from Firestore
- Display trips in grid layout
- Handle authentication checks

**State**:
```javascript
userTrips // Array of user's trips from Firestore
```

**Key Functions**:

#### `GetUserTrips()`
Queries Firestore for user's trips:
```javascript
const q = query(
  collection(db, 'AiTrips'),
  where('userEmail', '==', user?.email)
)
const querySnapshot = await getDocs(q)
// Map results to userTrips state
```

**Workflow**:
1. Check if user is logged in
2. If not, redirect to home page
3. If yes, fetch trips and display

**Layout**:
- Page header: "My Trips"
- Grid layout: responsive columns (2 on md, 3 on lg)
- Maps `userTrips` to UserTripCard components

**Dependencies**:
- UserTripCard
- Firebase Firestore
- React Router (navigation)

---

### UserTripCard.jsx
**Location**: [src/my-trips/components/UserTripCard.jsx](../src/my-trips/components/UserTripCard.jsx)

**Role**: Display trip card in user dashboard

**Responsibilities**:
- Fetch location photo
- Display trip summary
- Navigate to trip details on click

**Props**:
```javascript
trip // Complete trip object {userSelection, tripData, id}
```

**State**:
```javascript
photoUrl // Location photo from Google Places
```

**Key Functions**:

#### `GetPlacePhoto()`
Fetches photo for trip location

**UI Elements**:
- Location photo (card header)
- Destination name (bold)
- Trip duration (📆 icon + days)

**Interactions**:
- Entire card is clickable
- Navigates to `/view-trip/${trip?.id}` on click

**Dependencies**:
- GlobalApi
- React Router Link

---

## 7. UI Component Library

These are Shadcn/ui components located in [src/components/ui/](../src/components/ui/):

### button.jsx
Pre-styled button component with variants:
- `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `icon`
- Built with Class Variance Authority (CVA)

### input.jsx
Styled text input component with consistent styling

### dialog.jsx
Modal dialog component with:
- DialogTrigger
- DialogContent
- DialogHeader
- DialogTitle
- DialogDescription
- DialogFooter

Built on Radix UI primitives for accessibility

### popover.jsx
Popover component for dropdown menus:
- PopoverTrigger
- PopoverContent

### sonner.jsx
Toast notification component (Toaster)
- Used globally in main.jsx
- Displays success/error messages

---

## 8. Service Layer Components

### firebaseConfig.js
**Location**: [src/service/firebaseConfig.js](../src/service/firebaseConfig.js)

**Role**: Firebase initialization and configuration

**Exports**:
```javascript
export { db } // Firestore database instance
```

**Configuration**:
- Project ID: `trip-planner2-65a43`
- App ID: `1:826682224081:web:...`
- Firestore database initialized

---

### GlobalApi.jsx
**Location**: [src/service/GlobalApi.jsx](../src/service/GlobalApi.jsx)

**Role**: Google Places API wrapper

**Exports**:

#### `GetPlaceDetails(data)`
```javascript
// POST to Google Places API
// Returns: { data: { places: [{photos, displayName, id}] } }
```

#### `PHOTO_REF_URL`
Template URL for fetching place photos:
```
https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key={API_KEY}
```

**Configuration**:
- Uses `VITE_GOOGLE_PLACES_API_KEY`
- Field mask: `places.photos,places.displayName,places.id`

---

### AIModal.jsx
**Location**: [src/service/AIModal.jsx](../src/service/AIModal.jsx)

**Role**: Google Gemini AI integration

**Exports**:

#### `chatSession`
Pre-configured Gemini AI chat session with:
- Model: `gemini-1.5-flash`
- Temperature: 1
- Top P: 0.95
- Max tokens: 8192
- Response MIME type: `application/json`
- History: Sample trip generation exchange

**Usage**:
```javascript
const result = await chatSession.sendMessage(FINAL_PROMPT)
const response = JSON.parse(result.response.text())
```

---

## 9. Constants & Configuration

### options.jsx
**Location**: [src/constants/options.jsx](../src/constants/options.jsx)

**Role**: Store app constants and AI prompt template

**Exports**:

#### `SelectTravelesList`
Array of traveler options:
```javascript
[
  {id: 1, title: 'Just Me', desc: 'A sole traveles...', icon: '✈️', people: '1'},
  {id: 2, title: 'A Couple', desc: 'Two traveles...', icon: '🥂', people: '2 People'},
  {id: 3, title: 'Family', desc: 'A group of fun...', icon: '🏡', people: '3 to 5 People'},
  {id: 4, title: 'Friends', desc: 'A bunch of thrill...', icon: '⛵', people: '5 to 10 People'}
]
```

#### `SelectBudgetOptions`
Array of budget options:
```javascript
[
  {id: 1, title: 'Cheap', desc: 'Stay conscious of costs', icon: '💵'},
  {id: 2, title: 'Moderate', desc: 'Keep cost average', icon: '💰'},
  {id: 3, title: 'Luxury', desc: 'Dont worry about cost', icon: '💸'}
]
```

#### `AI_PROMPT`
Template for Gemini AI prompt:
```
Generate Travel Plan for Location: {location}, for {totalDays} Days for {traveler} with a {budget} budget, Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for {totalDays} days with each day plan with best time to visit in JSON format.
```

---

## 10. Utility Components

### utils.js
**Location**: [src/lib/utils.js](../src/lib/utils.js)

**Role**: Utility functions for className management

**Exports**:

#### `cn(...inputs)`
Merges TailwindCSS classes intelligently:
```javascript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

Used throughout UI components for conditional styling.

---

## Component Dependency Graph

```
main.jsx
  ├── App.jsx → Hero.jsx
  ├── Header.jsx
  ├── CreateTrip
  │   ├── GooglePlacesAutocomplete
  │   ├── Button, Input, Dialog (UI)
  │   ├── AIModal (service)
  │   ├── firebaseConfig (service)
  │   └── options (constants)
  ├── ViewTrip
  │   ├── InfoSection
  │   │   └── GlobalApi (service)
  │   ├── Hotels
  │   │   └── HotelCardItem
  │   │       └── GlobalApi (service)
  │   ├── TripPlace
  │   │   └── PlaceCardItem
  │   │       └── GlobalApi (service)
  │   └── Footer
  └── MyTrips
      ├── UserTripCard
      │   └── GlobalApi (service)
      └── firebaseConfig (service)
```

---

## Summary

The application is built with a clear component hierarchy, separating concerns between:
- **Page-level components** (CreateTrip, ViewTrip, MyTrips)
- **Layout components** (Header, Hero, Footer)
- **Feature components** (InfoSection, Hotels, TripPlace)
- **Card components** (HotelCardItem, PlaceCardItem, UserTripCard)
- **UI primitives** (Button, Input, Dialog, etc.)
- **Service layer** (Firebase, Google APIs, AI)
- **Constants** (Options, prompts)

This structure promotes reusability, maintainability, and clear separation of responsibilities.
