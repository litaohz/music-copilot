## Message Passing Architecture

The extension uses Chrome's message passing API for communication between components:

### Components:
1. **Content Script** (`contentScript.js`)
   - Detects music on web pages
   - Sends `MUSIC_DETECTED` messages to background script

2. **Background Script** (`background.js`)
   - Central state management
   - Handles `MUSIC_DETECTED` and `GET_CURRENT_STATE` messages
   - Broadcasts `STATE_UPDATE` messages to all views

3. **MusicUnderstanding Component** (`MusicUnderstanding.tsx`)
   - Requests current state with `GET_CURRENT_STATE`
   - Listens for `STATE_UPDATE` messages
   - Updates UI with received state

### Message Flow:
1. Content Script → Background Script (`MUSIC_DETECTED`)
2. Background Script → All Views (`STATE_UPDATE`)
3. UI Components ↔ Background Script (`GET_CURRENT_STATE`)

### Error Handling:
- All message handlers include error checking
- Proper cleanup of message listeners
- Null checks for initial state

### Permissions:
- Requires `tabs` and `activeTab` permissions
- Configured in manifest.json