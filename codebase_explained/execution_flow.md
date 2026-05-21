# Execution Flow

This document traces the journey of typical user operations through the AI Trip Planner application, showing how data flows across components and systems.

---

## Flow 1: User Authentication

### Trigger
User clicks "Sign In" button in Header or attempts to generate a trip without being logged in.

### Detailed Flow

```
1. User clicks "Sign In" button
   Location: Header.jsx or CreateTrip.jsx
   ↓

2. Open Google OAuth Dialog
   Function: setOpenDialog(true)
   Component: Dialog UI opens
   ↓

3. User clicks "Sign In With Google" in Dialog
   Function: login() is called
   ↓

4. Google OAuth Flow Begins
   Hook: useGoogleLogin()
   Action: Opens Google sign-in popup
   ↓

5. User Authorizes Application
   Platform: Google OAuth consent screen
   ↓

6. Receive Authorization Code
   Callback: onSuccess(codeResp)
   Data received: { access_token, ... }
   ↓

7. Fetch User Profile
   Function: GetUserProfile(codeResp)
   API Call: axios.get('https://www.googleapis.com/oauth2/v1/userinfo')
   Headers: { Authorization: `Bearer ${tokenInfo?.access_token}` }
   ↓

8. Receive User Data
   Response: { email, name, picture, ... }
   ↓

9. Store in LocalStorage
   Action: localStorage.setItem('user', JSON.stringify(resp.data))
   ↓

10. Update UI State
    Action: setOpenDialog(false)
    Effect: Dialog closes, user data appears in Header
    ↓

11. Continue with Original Action
    If from CreateTrip: OnGenerateTrip() is called
    If from Header: UI updates to show user profile
```

### Code Path

**Header.jsx**:
```javascript
const login = useGoogleLogin({
  onSuccess: (codeResp) => GetUserProfile(codeResp),
  onError: (error) => console.log(error)
})

const GetUserProfile = (tokenInfo) => {
  axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
    { headers: { Authorization: `Bearer ${tokenInfo?.access_token}` } }
  ).then((resp) => {
    localStorage.setItem('user', JSON.stringify(resp.data))
    setOpenDialog(false)
    window.location.reload()
  })
}
```

### Data Flow Diagram

```
[User] → [Sign In Button] → [Dialog Open]
                               ↓
                          [Google OAuth]
                               ↓
                          [Access Token]
                               ↓
                    [GET /oauth2/v1/userinfo]
                               ↓
                          [User Profile JSON]
                               ↓
                          [localStorage]
                               ↓
                    [Header UI Updates]
```

---

## Flow 2: Trip Creation (Complete Journey)

### Trigger
User fills out trip form and clicks "Generate Trip" button.

### Detailed Flow

```
1. User Navigates to /create-trip
   Component: CreateTrip.jsx loads
   ↓

2. User Fills Form Fields

   2a. Select Destination
       Component: GooglePlacesAutocomplete
       Action: User types location
       Effect: setPlace(value) + handleInputChange('location', value)
       Data: { label: "Paris, France", value: {...} }
   ↓

   2b. Enter Trip Duration
       Component: Input (number)
       Action: User types days (1-5)
       Effect: handleInputChange('noOfDays', e.target.value)
   ↓

   2c. Select Budget
       Component: SelectBudgetOptions cards
       Action: User clicks budget card
       Effect: handleInputChange('budget', item.title)
       Options: 'Cheap', 'Moderate', 'Luxury'
   ↓

   2d. Select Traveler Type
       Component: SelectTravelesList cards
       Action: User clicks traveler card
       Effect: handleInputChange('traveler', item.title)
       Options: 'Just Me', 'A Couple', 'Family', 'Friends'
   ↓

3. Click "Generate Trip" Button
   Function: OnGenerateTrip()
   ↓

4. Authentication Check
   Code: const user = localStorage.getItem('user')

   If user === null:
     ├─→ setOpenDialog(true)
     ├─→ Show authentication dialog
     ├─→ Wait for login (see Flow 1)
     └─→ After login, return to step 3

   If user exists:
     └─→ Continue to step 5
   ↓

5. Form Validation
   Check 1: formData?.noOfDays > 5
     └─→ If true: toast("Please enter trip days less than 5")
         └─→ STOP

   Check 2: All fields filled?
     └─→ If false: toast("Please fill all the details")
         └─→ STOP

   If all valid:
     └─→ Continue to step 6
   ↓

6. Show Loading State
   Action: setLoading(true)
   Effect: Button shows loading spinner
   ↓

7. Build AI Prompt
   Template: AI_PROMPT from constants/options.jsx

   Replacements:
     {location}   → formData.location.label
     {totalDays}  → formData.noOfDays
     {traveler}   → formData.traveler
     {budget}     → formData.budget

   Example Result:
     "Generate Travel Plan for Location: Paris, France, for 3 Days
      for A Couple with a Moderate budget, Give me a Hotels options
      list with HotelName, Hotel address, Price... [full prompt]"
   ↓

8. Call Gemini AI
   Service: AIModal.jsx
   Function: chatSession.sendMessage(FINAL_PROMPT)

   Request Flow:
     ├─→ HTTP POST to Google Gemini API
     ├─→ Model: gemini-1.5-flash
     ├─→ Config: temperature=1, topP=0.95, maxTokens=8192
     └─→ Response format: application/json
   ↓

9. Wait for AI Response
   Duration: ~3-10 seconds (varies)
   ↓

10. Receive AI Response
    Raw Response: result.response.text()
    Format: JSON string
    ↓

11. Parse JSON Response
    Action: JSON.parse(result.response.text())

    Expected Structure:
    {
      "hotelOptions": [
        {
          "hotelName": "Hotel Eiffel",
          "hotelAddress": "123 Paris St",
          "price": "€150-€200",
          "hotelImageUrl": "url",
          "geoCoordinates": "48.8566, 2.3522",
          "rating": 4.5,
          "description": "..."
        },
        // ... more hotels
      ],
      "itinerary": [
        {
          "day": "Day 1",
          "plan": [
            {
              "placeName": "Eiffel Tower",
              "placeDetails": "Iconic landmark...",
              "placeImageUrl": "url",
              "geoCoordinates": "48.8584, 2.2945",
              "ticketPricing": "€25",
              "rating": 4.8,
              "timeTravel": "2-3 hours"
            },
            // ... more places
          ]
        },
        // ... more days
      ]
    }
    ↓

12. Save Trip to Firestore
    Function: SaveAiTrip(TripData)

    Document Structure:
    {
      id: Date.now().toString(),
      userSelection: formData,
      tripData: TripData (parsed AI response),
      userEmail: user?.email
    }

    Firestore Operation:
    db.collection("AiTrips")
      .doc(Date.now().toString())
      .set({...})
    ↓

13. Get Document ID
    Variable: docId = Date.now().toString()
    ↓

14. Show Success Message
    Action: toast("Your trip generated successfully!")
    ↓

15. Hide Loading State
    Action: setLoading(false)
    ↓

16. Navigate to Trip View
    Action: navigate('/view-trip/' + docId)
    Route: /view-trip/1733184000000
    ↓

17. User Sees Complete Trip
    Component: ViewTrip.jsx loads with trip data
```

### Code Path

**CreateTrip/index.jsx**:
```javascript
const OnGenerateTrip = async () => {
  const user = localStorage.getItem('user')

  if (!user) {
    setOpenDialog(true)
    return
  }

  if (formData?.noOfDays > 5) {
    toast("Please enter trip days less than 5")
    return
  }

  if (!formData?.location || !formData?.budget || !formData?.traveler) {
    toast("Please fill all the details")
    return
  }

  setLoading(true)

  const FINAL_PROMPT = AI_PROMPT
    .replace('{location}', formData?.location?.label)
    .replace('{totalDays}', formData?.noOfDays)
    .replace('{traveler}', formData?.traveler)
    .replace('{budget}', formData?.budget)
    .replace('{totalDays}', formData?.noOfDays)

  const result = await chatSession.sendMessage(FINAL_PROMPT)

  setLoading(false)
  SaveAiTrip(result?.response?.text())
}

const SaveAiTrip = async (TripData) => {
  setLoading(true)

  const user = JSON.parse(localStorage.getItem('user'))
  const docId = Date.now().toString()

  await setDoc(doc(db, "AiTrips", docId), {
    userSelection: formData,
    tripData: JSON.parse(TripData),
    userEmail: user?.email,
    id: docId
  })

  setLoading(false)
  toast("Your trip generated successfully!")
  navigate('/view-trip/' + docId)
}
```

### Data Flow Diagram

```
[User Input Form]
    ↓
[Form Validation]
    ↓
[Build AI Prompt]
    ↓
[Gemini AI API] ←→ [Google Cloud]
    ↓
[JSON Response]
    ↓
[Parse Data]
    ↓
[Firestore Save] ←→ [Firebase Backend]
    ↓
[Get Document ID]
    ↓
[Navigate to View]
```

---

## Flow 3: Viewing a Trip

### Trigger
User navigates to `/view-trip/:tripId` (from MyTrips or after creating trip).

### Detailed Flow

```
1. Navigate to /view-trip/:tripId
   URL Example: /view-trip/1733184000000
   Component: ViewTrip.jsx loads
   ↓

2. Extract Trip ID from URL
   Hook: useParams()
   Code: const { tripId } = useParams()
   Result: tripId = "1733184000000"
   ↓

3. Fetch Trip Data from Firestore
   Function: GetTripData()
   Trigger: useEffect runs on mount

   Firestore Query:
     const docRef = doc(db, 'AiTrips', tripId)
     const docSnap = await getDoc(docRef)
   ↓

4. Receive Trip Document
   Data: {
     id: "1733184000000",
     userEmail: "user@gmail.com",
     userSelection: {
       location: { label: "Paris, France", ... },
       noOfDays: "3",
       budget: "Moderate",
       traveler: "A Couple"
     },
     tripData: {
       hotelOptions: [...],
       itinerary: [...]
     }
   }
   ↓

5. Update Component State
   Action: setTrip(docSnap.data())
   Effect: Triggers re-render with trip data
   ↓

6. Render InfoSection Component
   Props: trip={trip}
   ↓

   6a. InfoSection Initialization
       useEffect: Fetch location photo
       ↓

   6b. Call Google Places API
       Function: GetPlacePhoto()
       API: GetPlaceDetails(trip.userSelection.location.label)

       Request:
         POST https://places.googleapis.com/v1/places:searchText
         Body: { textQuery: "Paris, France" }
         Headers: { X-Goog-Api-Key: ..., X-Goog-FieldMask: ... }
       ↓

   6c. Receive Places Response
       Data: {
         places: [{
           photos: [{ name: "places/ChIJ.../photos/..." }],
           displayName: { text: "Paris" },
           id: "ChIJ..."
         }]
       }
       ↓

   6d. Build Photo URL
       Template: PHOTO_REF_URL
       Replace: {NAME} → photos[0].name
       Result: https://places.googleapis.com/v1/.../media?maxHeightPx=600&key=...
       ↓

   6e. Set Photo URL State
       Action: setPhotoUrl(url)
       Effect: Image loads and displays
       ↓

   6f. Render InfoSection UI
       - Location banner image
       - Trip title
       - Day/budget/traveler badges
   ↓

7. Render Hotels Component
   Props: trip={trip}
   Data: trip.tripData.hotelOptions
   ↓

   7a. Map Through Hotel Options
       Loop: trip?.tripData?.hotelOptions?.map()
       ↓

   7b. For Each Hotel, Render HotelCardItem
       Props: hotel={hotel}
       ↓

   7c. HotelCardItem Initialization
       useEffect: Fetch hotel photo
       Function: GetPlacePhoto()
       Query: hotel.hotelName
       ↓

   7d. Same Google Places API Flow
       (Steps similar to 6b-6e)
       ↓

   7e. Render Hotel Card UI
       - Hotel photo
       - Name, address
       - Price (💰 icons)
       - Rating (⭐ icons)
       - Description
       - "View on Google Maps" link
   ↓

8. Render TripPlace Component
   Props: trip={trip}
   Data: trip.tripData.itinerary
   ↓

   8a. Map Through Itinerary Days
       Loop: trip?.tripData?.itinerary?.map()
       ↓

   8b. For Each Day:
       Render Day Header (e.g., "Day 1")
       ↓

   8c. Map Through Places in Day
       Loop: day.plan.map()
       ↓

   8d. For Each Place, Render PlaceCardItem
       Props: place={place}
       ↓

   8e. PlaceCardItem Initialization
       useEffect: Fetch place photo
       Function: GetPlacePhoto()
       Query: place.placeName
       ↓

   8f. Same Google Places API Flow
       (Steps similar to 6b-6e)
       ↓

   8g. Render Place Card UI
       - Place photo
       - Name, details
       - Time to travel (🕒)
       - Ticket pricing (💵)
       - "View on Google Maps" link
   ↓

9. Render Footer Component
   Static content: Logo and copyright
   ↓

10. Page Fully Rendered
    User sees:
    - Location header with photo
    - Trip details
    - 3+ hotel options with photos
    - Day-by-day itinerary with photos
    - All places clickable to Google Maps
```

### Code Path

**ViewTrip/index.jsx**:
```javascript
const { tripId } = useParams()
const [trip, setTrip] = useState()

useEffect(() => {
  tripId && GetTripData()
}, [tripId])

const GetTripData = async () => {
  const docRef = doc(db, 'AiTrips', tripId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    setTrip(docSnap.data())
  }
}
```

**InfoSection.jsx**:
```javascript
const [photoUrl, setPhotoUrl] = useState()

useEffect(() => {
  trip && GetPlacePhoto()
}, [trip])

const GetPlacePhoto = async () => {
  const data = { textQuery: trip?.userSelection?.location?.label }
  const result = await GetPlaceDetails(data).then(resp => {
    const PhotoUrl = PHOTO_REF_URL.replace(
      '{NAME}',
      resp.data.places[0].photos[3].name
    )
    setPhotoUrl(PhotoUrl)
  })
}
```

### Data Flow Diagram

```
[URL: /view-trip/:tripId]
         ↓
    [useParams()]
         ↓
    [tripId = "..."]
         ↓
    [Firestore Query]
         ↓
    [Trip Document]
         ↓
    [setTrip(data)]
         ↓
┌────────┴────────┐
│                 │
▼                 ▼
[InfoSection]   [Hotels]      [TripPlace]
     ↓              ↓              ↓
[GetPlacePhoto] [HotelCard×N]  [PlaceCard×N]
     ↓              ↓              ↓
[Google Places] [GetPhoto×N]   [GetPhoto×N]
     ↓              ↓              ↓
[Photo URL]    [Photo URLs]   [Photo URLs]
     ↓              ↓              ↓
[Render UI]    [Render Cards] [Render Cards]
```

---

## Flow 4: Viewing User's Trip List

### Trigger
User clicks "My Trips" button in Header or navigates to `/my-trips`.

### Detailed Flow

```
1. Navigate to /my-trips
   Component: MyTrips.jsx loads
   ↓

2. Check Authentication
   Function: GetUserTrips()
   Code: const user = JSON.parse(localStorage.getItem('user'))

   If user === null:
     ├─→ navigate('/')
     └─→ STOP (redirect to home)

   If user exists:
     └─→ Continue to step 3
   ↓

3. Query Firestore for User's Trips
   Query Builder:
     const q = query(
       collection(db, 'AiTrips'),
       where('userEmail', '==', user?.email)
     )

   Execute Query:
     const querySnapshot = await getDocs(q)
   ↓

4. Receive Query Results
   Data: Array of document snapshots
   ↓

5. Transform Documents to Array
   Code: querySnapshot.docs.map(doc => doc.data())

   Result: [
     { id: "123", userSelection: {...}, tripData: {...} },
     { id: "456", userSelection: {...}, tripData: {...} },
     ...
   ]
   ↓

6. Update Component State
   Action: setUserTrips(trips)
   Effect: Triggers re-render with trip data
   ↓

7. Render Page Header
   Text: "My Trips"
   ↓

8. Map Through User Trips
   Loop: userTrips?.map((trip, index) => ...)
   ↓

9. For Each Trip, Render UserTripCard
   Props: trip={trip}, key={index}
   ↓

   9a. UserTripCard Initialization
       useEffect: Fetch location photo
       ↓

   9b. Call Google Places API
       Function: GetPlacePhoto()
       Query: trip.userSelection.location.label
       (Same flow as ViewTrip InfoSection)
       ↓

   9c. Set Photo URL State
       Action: setPhotoUrl(url)
       ↓

   9d. Render Card UI
       - Location photo (clickable)
       - Destination name
       - Trip duration badge
       ↓

   9e. Handle Card Click
       Component: <Link to={'/view-trip/' + trip?.id}>
       Action: Navigate to trip details page
   ↓

10. Page Fully Rendered
    User sees grid of all their trips
    Each card is clickable to view details
```

### Code Path

**MyTrips/index.jsx**:
```javascript
const [userTrips, setUserTrips] = useState([])

useEffect(() => {
  GetUserTrips()
}, [])

const GetUserTrips = async () => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    navigate('/')
    return
  }

  const q = query(
    collection(db, 'AiTrips'),
    where('userEmail', '==', user?.email)
  )

  const querySnapshot = await getDocs(q)
  setUserTrips(querySnapshot.docs.map(doc => doc.data()))
}
```

**UserTripCard.jsx**:
```javascript
const [photoUrl, setPhotoUrl] = useState()

useEffect(() => {
  trip && GetPlacePhoto()
}, [trip])

const GetPlacePhoto = async () => {
  const data = { textQuery: trip?.userSelection?.location?.label }
  const result = await GetPlaceDetails(data).then(resp => {
    const PhotoUrl = PHOTO_REF_URL.replace(
      '{NAME}',
      resp.data.places[0].photos[3].name
    )
    setPhotoUrl(PhotoUrl)
  })
}

// Render
<Link to={'/view-trip/' + trip?.id}>
  <img src={photoUrl} />
  <h2>{trip?.userSelection?.location?.label}</h2>
  <h2>{trip?.userSelection?.noOfDays} Days</h2>
</Link>
```

### Data Flow Diagram

```
[User Clicks "My Trips"]
         ↓
[Check localStorage]
         ↓
[User Authenticated?] ─No→ [Redirect to /]
         │
        Yes
         ↓
[Query Firestore]
where userEmail == user.email
         ↓
[Receive Trip Documents]
         ↓
[Map to Array]
         ↓
[setUserTrips(array)]
         ↓
[Render Grid]
         ↓
[For Each Trip:]
    ↓
[UserTripCard]
    ↓
[Fetch Photo] ←→ [Google Places API]
    ↓
[Render Card with Photo]
    ↓
[Click Card] → [Navigate to /view-trip/:id]
```

---

## Flow 5: Photo Loading (Cross-Component Pattern)

This flow is used by InfoSection, HotelCardItem, PlaceCardItem, and UserTripCard.

### Detailed Flow

```
1. Component Receives Data
   Props: trip/hotel/place with name/location
   ↓

2. Initialize State
   Code: const [photoUrl, setPhotoUrl] = useState()
   ↓

3. Run Effect on Data Change
   Hook: useEffect(() => { GetPlacePhoto() }, [trip])
   ↓

4. Build Query Data
   Code: const data = { textQuery: "Place Name" }
   ↓

5. Call Google Places API
   Function: GetPlaceDetails(data)

   Request Details:
     Method: POST
     URL: https://places.googleapis.com/v1/places:searchText
     Headers:
       Content-Type: application/json
       X-Goog-Api-Key: VITE_GOOGLE_PLACES_API_KEY
       X-Goog-FieldMask: places.photos,places.displayName,places.id
     Body: { textQuery: "Place Name" }
   ↓

6. Wait for API Response
   Duration: ~200-500ms
   ↓

7. Receive Places Data
   Response: {
     places: [{
       photos: [
         { name: "places/ChIJD7fiBh9u5kcRYJSMaMOCCwQ/photos/AUc7tXV..." },
         { name: "places/ChIJD7fiBh9u5kcRYJSMaMOCCwQ/photos/..." },
         ...
       ],
       displayName: { text: "Eiffel Tower" },
       id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ"
     }]
   }
   ↓

8. Extract Photo Reference
   Code: resp.data.places[0].photos[3].name
   (Note: Uses photo index 3 for variety)
   ↓

9. Build Media URL
   Template: PHOTO_REF_URL
   Value: "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key={API_KEY}"

   Replace {NAME} with photo reference:
   Result: "https://places.googleapis.com/v1/places/.../photos/.../media?maxHeightPx=600&maxWidthPx=600&key=..."
   ↓

10. Update State with URL
    Action: setPhotoUrl(PhotoUrl)
    Effect: Triggers re-render
    ↓

11. Image Element Loads
    JSX: <img src={photoUrl} />
    Browser: Fetches image from Google Places
    ↓

12. Image Displayed
    User sees photo in UI
```

### Code Pattern

**GlobalApi.jsx**:
```javascript
import axios from "axios"

const BASE_URL = 'https://places.googleapis.com/v1/places:searchText'

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
    'X-Goog-FieldMask': 'places.photos,places.displayName,places.id'
  }
}

export const GetPlaceDetails = (data) => axios.post(BASE_URL, data, config)

export const PHOTO_REF_URL =
  'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key=' +
  import.meta.env.VITE_GOOGLE_PLACES_API_KEY
```

**Component Pattern**:
```javascript
const [photoUrl, setPhotoUrl] = useState()

useEffect(() => {
  data && GetPlacePhoto()
}, [data])

const GetPlacePhoto = async () => {
  const queryData = { textQuery: data.name }

  await GetPlaceDetails(queryData).then(resp => {
    const PhotoUrl = PHOTO_REF_URL.replace(
      '{NAME}',
      resp.data.places[0].photos[3].name
    )
    setPhotoUrl(PhotoUrl)
  })
}

return <img src={photoUrl} />
```

---

## Flow 6: User Logout

### Trigger
User clicks "Sign Out" in Header profile dropdown.

### Detailed Flow

```
1. User Opens Profile Dropdown
   Component: Popover in Header.jsx
   ↓

2. Click "Sign Out" Button
   Function: onClick event handler
   ↓

3. Call Google Logout
   Function: googleLogout()
   Library: @react-oauth/google
   Effect: Clears Google OAuth session
   ↓

4. Clear LocalStorage
   Code: localStorage.clear()
   Effect: Removes user data from browser storage
   ↓

5. Reload Page
   Code: window.location.reload()
   Effect: Forces full page refresh
   ↓

6. App Reinitializes
   Header.jsx useEffect runs
   Finds no user in localStorage
   Updates UI to logged-out state
```

### Code Path

**Header.jsx**:
```javascript
<DropdownMenuItem onClick={() => {
  googleLogout()
  localStorage.clear()
  window.location.reload()
}}>
  Sign Out
</DropdownMenuItem>
```

---

## Summary: Key Execution Paths

| User Action | Entry Point | Key Components | External Services | Output |
|-------------|-------------|----------------|-------------------|--------|
| **Sign In** | Header/CreateTrip | Dialog, OAuth | Google OAuth API | User data in localStorage |
| **Create Trip** | CreateTrip form | Form inputs, AI prompt | Gemini AI, Firestore | Trip document, navigate to view |
| **View Trip** | /view-trip/:id URL | InfoSection, Hotels, TripPlace | Firestore, Google Places | Complete trip display with photos |
| **View All Trips** | /my-trips URL | MyTrips, UserTripCard | Firestore, Google Places | Grid of user trips |
| **Load Photos** | Any component | Photo fetch logic | Google Places API | Image URLs, rendered images |
| **Sign Out** | Header dropdown | Logout handler | Google OAuth | Clear state, reload page |

All flows share common patterns:
- **State Management**: useState hooks for local data
- **Side Effects**: useEffect for API calls
- **Data Fetching**: Async/await with error handling
- **Navigation**: React Router for page transitions
- **Persistence**: localStorage for client-side, Firestore for server-side
- **User Feedback**: Toast notifications for actions
- **Loading States**: Disable buttons and show spinners during async operations
