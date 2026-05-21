# Flow Diagrams

This document provides visual representations of all major workflows in the AI Trip Planner application using Mermaid diagrams.

---

## Diagram 1: Overall System Architecture

**Purpose**: High-level view of system components and their interactions.

```mermaid
graph TB
    subgraph "Client Browser"
        A[User Interface]
        B[React Application]
        C[Service Layer]
        D[Local Storage]
    end

    subgraph "External Services"
        E[Firebase Firestore]
        F[Google OAuth 2.0]
        G[Google Gemini AI]
        H[Google Places API]
    end

    A --> B
    B --> C
    B --> D
    C --> E
    C --> F
    C --> G
    C --> H

    style A fill:#e1f5ff
    style B fill:#b3e5fc
    style C fill:#81d4fa
    style D fill:#4fc3f7
    style E fill:#ffecb3
    style F fill:#ffe082
    style G fill:#ffd54f
    style H fill:#ffca28
```

**Explanation**:
- **User Interface**: All React components and pages
- **React Application**: Component logic and state management
- **Service Layer**: API wrappers (GlobalApi, AIModal, firebaseConfig)
- **Local Storage**: Browser storage for user authentication
- **External Services**: Third-party APIs and databases

---

## Diagram 2: Application Initialization Flow

**Purpose**: Shows how the application boots up and initializes.

```mermaid
sequenceDiagram
    participant Browser
    participant HTML
    participant Vite
    participant main.jsx
    participant React
    participant Router
    participant Header
    participant Page

    Browser->>HTML: Load index.html
    HTML->>Vite: Request /src/main.jsx
    Vite->>main.jsx: Compile & Bundle
    main.jsx->>main.jsx: Load environment vars
    main.jsx->>main.jsx: Create router config
    main.jsx->>React: Create root
    React->>Router: Render GoogleOAuthProvider
    Router->>Header: Render Header (persistent)
    Router->>Router: Match current URL
    Router->>Page: Render matched page component
    Page->>Browser: Display UI
```

**Explanation**:
- Browser loads HTML, which triggers JavaScript loading
- Vite compiles and bundles the application
- main.jsx initializes React and sets up routing
- Header renders outside router (persistent across routes)
- Router matches URL and renders appropriate page

---

## Diagram 3: User Authentication Flow

**Purpose**: Complete OAuth 2.0 authentication workflow.

```mermaid
flowchart TD
    A[User Clicks Sign In] --> B{User in localStorage?}
    B -->|Yes| C[Already Authenticated]
    B -->|No| D[Open Google OAuth Dialog]
    D --> E[User Clicks Sign In With Google]
    E --> F[Google OAuth Popup Opens]
    F --> G[User Authorizes Application]
    G --> H[Receive Access Token]
    H --> I[Call GetUserProfile]
    I --> J[GET /oauth2/v1/userinfo]
    J --> K[Receive User Data]
    K --> L[Store in localStorage]
    L --> M[Close Dialog]
    M --> N[Update Header UI]
    N --> O[Continue Original Action]

    style A fill:#e3f2fd
    style D fill:#fff3e0
    style F fill:#fff3e0
    style J fill:#e8f5e9
    style L fill:#f3e5f5
    style N fill:#e1f5fe
```

**Explanation**:
- System checks localStorage for existing user data
- If not found, opens Google OAuth dialog
- User authorizes, system receives access token
- Token used to fetch user profile from Google
- Profile stored in localStorage for persistence
- UI updates to reflect authenticated state

---

## Diagram 4: Trip Creation Flow (Complete)

**Purpose**: End-to-end trip generation process.

```mermaid
flowchart TD
    A[User Navigates to /create-trip] --> B[Load CreateTrip Component]
    B --> C[User Fills Form]
    C --> D[Select Destination]
    C --> E[Enter Days 1-5]
    C --> F[Select Budget]
    C --> G[Select Traveler Type]

    D --> H[Click Generate Trip]
    E --> H
    F --> H
    G --> H

    H --> I{User Authenticated?}
    I -->|No| J[Show Auth Dialog]
    J --> K[Complete OAuth Flow]
    K --> I
    I -->|Yes| L{Validate Form}

    L -->|Invalid| M[Show Error Toast]
    M --> C
    L -->|Valid| N[Set Loading State]

    N --> O[Build AI Prompt]
    O --> P[Replace Template Variables]
    P --> Q[Call Gemini AI API]
    Q --> R[Wait for Response 3-10s]
    R --> S[Receive JSON Response]
    S --> T[Parse Trip Data]
    T --> U[Generate Document ID]
    U --> V[Save to Firestore]
    V --> W[Show Success Toast]
    W --> X[Navigate to /view-trip/:id]
    X --> Y[Display Trip Details]

    style A fill:#e3f2fd
    style I fill:#fff3e0
    style L fill:#fff3e0
    style Q fill:#e8f5e9
    style V fill:#f3e5f5
    style Y fill:#e1f5fe
```

**Explanation**:
- User fills out four required form fields
- System validates authentication and form data
- AI prompt built with user selections
- Gemini AI generates trip itinerary
- Response saved to Firestore with unique ID
- User redirected to view their new trip

---

## Diagram 5: Trip Viewing Flow

**Purpose**: How trip details are loaded and displayed.

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant ViewTrip
    participant Firestore
    participant InfoSection
    participant Hotels
    participant TripPlace
    participant GooglePlaces

    User->>Router: Navigate to /view-trip/:tripId
    Router->>ViewTrip: Render component
    ViewTrip->>ViewTrip: Extract tripId from URL
    ViewTrip->>Firestore: Query doc(AiTrips, tripId)
    Firestore-->>ViewTrip: Return trip document
    ViewTrip->>ViewTrip: setTrip(data)

    ViewTrip->>InfoSection: Pass trip prop
    InfoSection->>GooglePlaces: GetPlacePhoto(location)
    GooglePlaces-->>InfoSection: Return photo URL
    InfoSection->>User: Display header with photo

    ViewTrip->>Hotels: Pass trip prop
    Hotels->>Hotels: Map hotelOptions
    loop For each hotel
        Hotels->>GooglePlaces: GetPlacePhoto(hotelName)
        GooglePlaces-->>Hotels: Return photo URL
    end
    Hotels->>User: Display hotel cards

    ViewTrip->>TripPlace: Pass trip prop
    TripPlace->>TripPlace: Map itinerary days
    loop For each place
        TripPlace->>GooglePlaces: GetPlacePhoto(placeName)
        GooglePlaces-->>TripPlace: Return photo URL
    end
    TripPlace->>User: Display itinerary with photos
```

**Explanation**:
- URL parameter provides trip ID
- ViewTrip fetches trip data from Firestore
- Data passed to child components via props
- Each component independently fetches photos from Google Places
- Photos load asynchronously as they're fetched
- Complete trip displayed with all details

---

## Diagram 6: My Trips Dashboard Flow

**Purpose**: Loading and displaying user's trip history.

```mermaid
flowchart TD
    A[User Clicks My Trips] --> B[Navigate to /my-trips]
    B --> C[MyTrips Component Loads]
    C --> D{Check localStorage for user}
    D -->|No User| E[Redirect to Home /]
    D -->|User Found| F[Query Firestore]
    F --> G[where userEmail == user.email]
    G --> H[Get All Matching Documents]
    H --> I[Map to Array]
    I --> J[setUserTrips]
    J --> K[Render Grid Layout]
    K --> L[For Each Trip]
    L --> M[Render UserTripCard]
    M --> N[Fetch Location Photo]
    N --> O[Display Card with Photo]
    O --> P[User Clicks Card]
    P --> Q[Navigate to /view-trip/:id]

    style A fill:#e3f2fd
    style D fill:#fff3e0
    style F fill:#e8f5e9
    style N fill:#e8f5e9
    style Q fill:#e1f5fe
```

**Explanation**:
- User must be authenticated to view trips
- Firestore queried for all trips matching user's email
- Results mapped to state and rendered as grid
- Each card fetches its location photo independently
- Cards are clickable, navigating to full trip details

---

## Diagram 7: Photo Loading Pattern

**Purpose**: Common pattern used across multiple components for loading images.

```mermaid
sequenceDiagram
    participant Component
    participant State
    participant GooglePlaces
    participant Browser

    Component->>Component: useEffect triggered
    Component->>State: Initialize photoUrl = undefined
    Component->>GooglePlaces: POST /places:searchText
    Note over GooglePlaces: Query: { textQuery: "Place Name" }
    GooglePlaces-->>Component: Return places array
    Component->>Component: Extract photos[3].name
    Component->>Component: Build media URL
    Component->>State: setPhotoUrl(url)
    State-->>Component: Trigger re-render
    Component->>Browser: <img src={photoUrl} />
    Browser->>GooglePlaces: Fetch image
    GooglePlaces-->>Browser: Return 600x600 image
    Browser->>Component: Display image
```

**Explanation**:
- Pattern used by InfoSection, HotelCardItem, PlaceCardItem, UserTripCard
- Component initializes with no photo
- useEffect triggers API call when data available
- Google Places API returns place details with photo references
- Photo reference converted to full media URL
- State update triggers re-render with image
- Browser loads actual image from URL

---

## Diagram 8: Data Flow Architecture

**Purpose**: Shows how data moves through the application layers.

```mermaid
graph LR
    subgraph "User Actions"
        A[User Input]
    end

    subgraph "Presentation Layer"
        B[React Components]
        C[Local State]
    end

    subgraph "Service Layer"
        D[GlobalApi]
        E[AIModal]
        F[firebaseConfig]
    end

    subgraph "External APIs"
        G[Google Places]
        H[Gemini AI]
        I[Firestore]
        J[OAuth]
    end

    subgraph "Browser Storage"
        K[localStorage]
    end

    A --> B
    B --> C
    C --> B
    B --> D
    B --> E
    B --> F
    B --> K
    K --> B
    D --> G
    E --> H
    F --> I
    F --> J
    G --> D
    H --> E
    I --> F
    J --> F
    D --> B
    E --> B
    F --> B

    style A fill:#e3f2fd
    style B fill:#b3e5fc
    style C fill:#81d4fa
    style D fill:#ffecb3
    style E fill:#ffe082
    style F fill:#ffd54f
    style G fill:#c8e6c9
    style H fill:#a5d6a7
    style I fill:#81c784
    style J fill:#66bb6a
    style K fill:#f3e5f5
```

**Explanation**:
- User actions trigger component updates
- Components manage local state with hooks
- Components call service layer for external data
- Service layer abstracts API complexity
- External APIs return data to service layer
- Data flows back to components for rendering
- localStorage provides client-side persistence

---

## Diagram 9: Component Hierarchy

**Purpose**: Visual representation of component relationships.

```mermaid
graph TD
    A[main.jsx] --> B[GoogleOAuthProvider]
    B --> C[Header]
    B --> D[Toaster]
    B --> E[RouterProvider]

    E --> F[App]
    E --> G[CreateTrip]
    E --> H[ViewTrip]
    E --> I[MyTrips]

    F --> J[Hero]

    G --> K[GooglePlacesAutocomplete]
    G --> L[Input]
    G --> M[Button]
    G --> N[Dialog]

    H --> O[InfoSection]
    H --> P[Hotels]
    H --> Q[TripPlace]
    H --> R[Footer]

    P --> S[HotelCardItem]
    Q --> T[PlaceCardItem]

    I --> U[UserTripCard]

    style A fill:#e3f2fd
    style E fill:#b3e5fc
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
    style O fill:#e8f5e9
    style P fill:#e8f5e9
    style Q fill:#e8f5e9
    style S fill:#f3e5f5
    style T fill:#f3e5f5
    style U fill:#f3e5f5
```

**Explanation**:
- main.jsx is the root, setting up providers and routing
- Router determines which page component renders
- Each page has its own set of child components
- Card components (HotelCardItem, PlaceCardItem, UserTripCard) are reusable
- UI primitives (Button, Input, Dialog) used throughout

---

## Diagram 10: State Management Flow

**Purpose**: How different types of state are managed.

```mermaid
flowchart TD
    subgraph "Component State"
        A[useState Hooks]
        A1[formData]
        A2[loading]
        A3[photoUrl]
        A --> A1
        A --> A2
        A --> A3
    end

    subgraph "Client Storage"
        B[localStorage]
        B1[user data]
        B --> B1
    end

    subgraph "Server State"
        C[Firebase Firestore]
        C1[AiTrips Collection]
        C --> C1
    end

    subgraph "Session State"
        D[OAuth Provider Context]
        D1[Authentication]
        D --> D1
    end

    E[User Actions] --> A
    A --> F[UI Updates]

    E --> B
    B --> G[Auth Check]
    G --> A

    E --> C
    C --> A
    A --> C

    E --> D
    D --> B

    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e9
    style D fill:#fff3e0
    style E fill:#ffecb3
```

**Explanation**:
- **Component State**: Temporary UI state, form inputs, loading states
- **localStorage**: Persistent authentication across sessions
- **Firestore**: Server-side trip data storage
- **OAuth Context**: Authentication state provided by library
- Data flows between layers based on user actions

---

## Diagram 11: Error Handling Flow

**Purpose**: How errors are caught and displayed to users.

```mermaid
flowchart TD
    A[User Action] --> B[Component Function]
    B --> C{Try Operation}
    C -->|Success| D[Process Response]
    C -->|Error| E[Catch Error]
    D --> F[Update State]
    F --> G[Render Success UI]
    E --> H[Log to Console]
    E --> I[Show Toast Notification]
    I --> J[User Sees Error Message]

    K[Form Validation] --> L{Valid?}
    L -->|No| M[Show Toast]
    M --> N[User Corrects Input]
    L -->|Yes| O[Continue Processing]

    style A fill:#e3f2fd
    style C fill:#fff3e0
    style E fill:#ffcdd2
    style I fill:#ef9a9a
    style K fill:#e3f2fd
    style M fill:#ef9a9a
```

**Explanation**:
- Operations wrapped in try-catch or .then/.catch
- Errors logged to console for debugging
- Toast notifications inform users of errors
- Form validation prevents invalid submissions
- Validation errors shown via toast messages

---

## Diagram 12: Trip Creation State Machine

**Purpose**: State transitions during trip generation.

```mermaid
stateDiagram-v2
    [*] --> FormEmpty: Page Load
    FormEmpty --> FormFilling: User Types
    FormFilling --> FormComplete: All Fields Filled
    FormComplete --> FormFilling: User Edits
    FormComplete --> Validating: Click Generate
    Validating --> FormFilling: Validation Failed
    Validating --> Authenticating: Validation Passed
    Authenticating --> WaitingAuth: No User
    WaitingAuth --> Authenticating: Login Complete
    Authenticating --> GeneratingAI: User Authenticated
    GeneratingAI --> SavingTrip: AI Response Received
    SavingTrip --> NavigatingAway: Save Complete
    NavigatingAway --> [*]: Route Changed

    note right of FormEmpty
        Initial state with
        empty form fields
    end note

    note right of GeneratingAI
        Loading spinner shown
        Button disabled
    end note

    note right of SavingTrip
        Writing to Firestore
        Document created
    end note
```

**Explanation**:
- Form starts empty, user fills fields
- Validation occurs on submission
- Authentication check required
- AI generation shows loading state
- Successful completion navigates to view page
- Each state has specific UI feedback

---

## Diagram 13: User Session Lifecycle

**Purpose**: How user authentication persists across visits.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant localStorage
    participant Header
    participant GoogleOAuth

    Note over User,GoogleOAuth: First Visit
    User->>Browser: Visit site
    Browser->>Header: Render Header
    Header->>localStorage: Check for user
    localStorage-->>Header: null (no user)
    Header->>User: Show "Sign In" button

    User->>Header: Click Sign In
    Header->>GoogleOAuth: Initiate OAuth
    GoogleOAuth-->>Header: Return user data
    Header->>localStorage: Store user data
    Header->>User: Show profile

    Note over User,GoogleOAuth: Page Refresh
    User->>Browser: Refresh page
    Browser->>Header: Render Header
    Header->>localStorage: Check for user
    localStorage-->>Header: Return user data
    Header->>User: Show profile (still logged in)

    Note over User,GoogleOAuth: Sign Out
    User->>Header: Click Sign Out
    Header->>GoogleOAuth: Call googleLogout()
    Header->>localStorage: Clear all data
    Header->>Browser: Reload page
    Browser->>Header: Render Header
    Header->>User: Show "Sign In" button
```

**Explanation**:
- First visit: No user in localStorage, shows sign in
- After OAuth: User data stored, persists in localStorage
- Page refresh: Header checks localStorage, finds user, stays logged in
- Sign out: Clears localStorage, reloads page, resets state
- No server-side session tracking

---

## Diagram 14: API Call Patterns

**Purpose**: Common patterns for external API interactions.

```mermaid
flowchart LR
    subgraph "Component Layer"
        A[Component]
        B[useEffect Hook]
    end

    subgraph "Service Layer"
        C[Service Function]
        D[Axios/SDK]
    end

    subgraph "External APIs"
        E[Google Places]
        F[Gemini AI]
        G[Firestore]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    E --> D
    F --> D
    G --> D
    D --> C
    C --> A
    A --> H[Update State]
    H --> I[Re-render UI]

    style A fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#ffecb3
    style E fill:#e8f5e9
    style F fill:#e8f5e9
    style G fill:#e8f5e9
```

**Explanation**:
- Components use useEffect for side effects (API calls)
- Service layer abstracts API details
- Axios or SDK handles HTTP/network layer
- Responses flow back through layers
- State updates trigger UI re-renders
- Pattern consistent across all API interactions

---

## Summary

These diagrams illustrate:

1. **System Architecture**: Overall structure and external dependencies
2. **Initialization**: How the app boots up
3. **Authentication**: OAuth flow and session management
4. **Trip Creation**: End-to-end generation process
5. **Trip Viewing**: Data fetching and display
6. **Dashboard**: User's trip list
7. **Photo Loading**: Repeated pattern across components
8. **Data Flow**: How information moves through layers
9. **Component Hierarchy**: Parent-child relationships
10. **State Management**: Different types of state
11. **Error Handling**: User feedback mechanisms
12. **State Machine**: Trip creation states
13. **Session Lifecycle**: Authentication persistence
14. **API Patterns**: Common communication patterns

These visual representations complement the textual documentation and provide quick reference for understanding system flows.
