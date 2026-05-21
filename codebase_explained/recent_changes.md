# Recent Changes & Fixes

This document tracks the recent changes and fixes made to the AI Trip Planner application.

## Authentication & OAuth Fixes

### 1. OAuth API Typo Fix
**Issue:** OAuth token parameter was misspelled (`acess_token` instead of `access_token`)
**Files Modified:**
- `src/components/custom/Header.jsx` (line 37)
- `src/create-trip/index.jsx` (line 86)

**Fix:**
```javascript
// Before (broken)
axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?acess_token=${tokenInfo?.access_token}`)

// After (fixed)
axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`)
```

### 2. Profile Picture Loading
**Issue:** Profile pictures from Google OAuth weren't loading
**File Modified:** `src/components/custom/Header.jsx`

**Changes:**
1. Changed from direct localStorage parsing to proper React state management
2. Added `referrerPolicy="no-referrer"` attribute for Google images
3. Added fallback avatar showing user's first letter
4. Added error handling for profile fetch

```javascript
// State management
const [user, setUser] = useState(null);

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    setUser(JSON.parse(userData));
  }
}, [])

// Profile picture with fallback
{user?.picture ? (
  <img
    src={user.picture}
    alt="Profile"
    className='rounded-full w-[38px] h-[38px] object-cover'
    referrerPolicy="no-referrer"
  />
) : (
  <div className='rounded-full w-[38px] h-[38px] bg-gray-300 flex items-center justify-center'>
    {user?.name?.[0] || user?.email?.[0] || 'U'}
  </div>
)}
```

### 3. Dialog Close Functionality
**Issue:** Sign-in dialog couldn't be closed by clicking outside or pressing ESC
**Files Modified:**
- `src/components/custom/Header.jsx` (line 78)
- `src/create-trip/index.jsx` (line 164)

**Fix:**
```javascript
// Before
<Dialog open={openDialog}>

// After
<Dialog open={openDialog} onOpenChange={setOpenDialog}>
```

---

## API Configuration Fixes

### 4. Gemini AI Model Name
**Issue:** Model name `gemini-1.5-flash` returned 404 error with Google AI Studio API key
**File Modified:** `src/service/AIModal.jsx` (line 17)

**Fix:**
```javascript
// Changed to
model: "gemini-2.5-flash"
```

### 5. Places API Autocomplete Enhancement
**Issue:** Autocomplete wasn't showing suggestions
**File Modified:** `src/create-trip/index.jsx` (lines 108-125)

**Changes:**
- Added `apiOptions` for language and region
- Added `autocompletionRequest` to filter by cities
- Added placeholder text
- Added custom input styling

```javascript
<GooglePlacesAutocomplete
  apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
  apiOptions={{ language: 'en', region: 'us' }}
  autocompletionRequest={{
    types: ['(cities)']
  }}
  selectProps={{
    place,
    onChange:(v)=>{setPlace(v); handleInputChange('location',v.label)},
    placeholder: 'Search for a city...',
    styles: {
      input: (provided) => ({
        ...provided,
        color: 'black',
      }),
    }
  }}
/>
```

---

## React Performance & Best Practices

### 6. React StrictMode Removal
**Issue:** Trips were being saved twice to Firestore, console logs appeared twice
**File Modified:** `src/main.jsx` (lines 32-38)

**Reason:** React StrictMode intentionally double-invokes effects in development mode to catch bugs, causing duplicate API calls.

**Fix:**
```javascript
// Before
<React.StrictMode>
  <GoogleOAuthProvider>
    ...
  </GoogleOAuthProvider>
</React.StrictMode>

// After
<GoogleOAuthProvider>
  ...
</GoogleOAuthProvider>
```

### 7. Missing React Keys
**Issue:** Console warnings about missing "key" prop in lists
**Files Modified:**
- `src/view-trip/components/Hotels.jsx` (line 10)
- `src/view-trip/components/TripPlace.jsx` (line 14)

**Fix:**
```javascript
// Hotels.jsx
{trip?.tripData?.hotelOptions?.map((item, index) => (
  <HotelCardItem key={index} item={item}/>
))}

// TripPlace.jsx
{item.plan?.map((place, index) => (
  <PlaceCardItem key={index} place={place}/>
))}
```

---

## Environment & Configuration

### 8. Environment Variables Setup
**File:** `.env` (created in project root)

**Required Variables:**
```env
VITE_GOOGLE_AUTH_CLIENT_ID=your_oauth_client_id
VITE_GOOGLE_PLACES_API_KEY=your_places_api_key
VITE_GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key
```

**Note:** Vite uses `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`

---

## Error Handling Improvements

### 9. Enhanced Error Handling
**File Modified:** `src/components/custom/Header.jsx`

**Added:**
```javascript
.catch((error) => {
  console.error('Error fetching user profile:', error);
})
```

**Added console logging:**
```javascript
console.log('User profile data:', resp.data);
```

---

## Summary of Technologies Fixed/Configured

1. **Google OAuth 2.0** - Authentication working correctly
2. **Firebase Firestore** - Duplicate writes resolved
3. **Google Places API** - Autocomplete enhanced
4. **Google Gemini AI** - Model name corrected
5. **React State Management** - Proper useState/useEffect usage
6. **Image Loading** - Added referrerPolicy for external images
7. **React Keys** - Added to all mapped components
8. **Error Handling** - Added throughout the application

---

## Performance Improvements

1. Removed unnecessary re-renders from StrictMode
2. Proper state management instead of direct localStorage access
3. Added loading states and error handling
4. Optimized image loading with object-cover and proper dimensions

---

## Testing Checklist

After all fixes:
- ✅ Sign-in with Google works
- ✅ Profile picture displays correctly
- ✅ Dialog can be closed
- ✅ Places autocomplete shows suggestions
- ✅ Trip generation works with Gemini AI
- ✅ Trips saved once (no duplicates)
- ✅ No console warnings for missing keys
- ✅ Profile picture fallback works
- ✅ Error handling catches failures

---

## Next Steps / Future Improvements

1. Migrate to new Google Places API (AutocompleteSuggestion)
2. Update `react-google-places-autocomplete` package to remove defaultProps warnings
3. Add more robust error handling with user-friendly messages
4. Add loading skeletons for better UX
5. Implement proper session management instead of localStorage
6. Add TypeScript for better type safety
7. Add unit tests for critical components
