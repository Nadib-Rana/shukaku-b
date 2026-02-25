# Mission & XP System Setup Guide

## Overview

This document describes the complete Ranking, Mission Workflow, and Push Notification system implementation.

## Database Missions to Create

Run these queries to set up the required missions in your database:

```sql
-- Daily Login Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  'Daily Login',
  'daily_login',
  10,
  1,
  'DAILY'
);

-- 3 Posts Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  'Create 3 Bubbles',
  'create_3_posts',
  30,
  3,
  'DAILY'
);

-- 3 Favorites Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  'Add 3 Favorites',
  'add_3_favorites',
  15,
  3,
  'DAILY'
);

-- 3 Responses Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  'Create 3 Responses',
  'add_3_responses',
  15,
  3,
  'DAILY'
);

-- 7-Day Streak Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  '7-Day Streak',
  '7_day_streak',
  50,
  1,
  'STREAK'
);

-- 15-Day Streak Mission
INSERT INTO missions (id, title, slug, xp_reward, requirement_count, type)
VALUES (
  uuid_generate_v4(),
  '15-Day Streak',
  '15_day_streak',
  100,
  1,
  'STREAK'
);
```

## Implementation Details

### 1. Engagement (App Open) - Workflow 1

**File:** `src/user/user.service.ts`

- When user opens app (authenticates), `handleDailyLogin()` is called
- Streak is checked and updated
- Daily Login mission is automatically tracked
- **Reward:** +10 XP + Daily Login Mission completion
- **Push Notification:** "Daily login bonus! You earned +10 XP."

### 2. Activity (Content Creation) - Workflow 2

**File:** `src/post/post.service.ts` → `create()`

- When user creates a post/bubble, mission tracking is triggered
- Tracks: `create_3_posts` mission
- **Reward:** +30 XP when mission completes (3 posts)
- **Push Notification:** "🎉 Mission \"Create 3 Bubbles\" completed! You earned +30 XP."

### 3. Activity (Community Support) - Workflow 3

**Files:**

- `src/favorite/favorite.service.ts` → `toggleFavorite()`
- `src/response/response.service.ts` → `create()`

- When user adds favorite: Tracks `add_3_favorites` mission
- When user creates response: Tracks `add_3_responses` mission
- **Reward:** +15 XP each when missions complete
- **Push Notification:** Mission completion messages

### 4. Achievement (Daily Mission Completion) - Workflow 4

**File:** `src/mission/mission.service.ts` → `completeMission()`

- When mission requirements are met, mission is marked complete
- XP is awarded
- **Level-Up Logic:**
  - Level calculation: `Math.floor(totalXp / 100) + 1`
  - When level increases, 100 credits are added to inventory per level gained
  - **Push Notification:** "⭐ Level Up! You reached Level X. Credits have been added!"

### 5. Achievement (Long-Term Engagement Milestones) - Workflow 5

**File:** `src/streak/streak.service.ts` → `rewardDailyLogin()`

- 7-day streak triggers `7_day_streak` mission
  - **Reward:** +50 XP
  - **Push Notification:** "🔥 7-day streak achieved! You earned +50 XP."
- 15-day streak triggers `15_day_streak` mission
  - **Reward:** +100 XP
  - **Push Notification:** "🔥 15-day streak achieved! You earned +100 XP."

### 6. Conversion (Reward Usage) - Workflow 6

**File:** `src/inventory/inventory.service.ts` → `purchaseCreditWithXp()`

- User can spend 250 XP to buy premium post credits
- Level calculation on XP spend: Level may decrease if XP drops below level threshold
- **Push Notification:** Level changes are notified
- **Premium Post Features:**
  - GOLD_BUBBLE_CREDIT: 1-minute voice bubbles
  - URGENT_BUBBLE_CREDIT: Urgent/priority bubbles
  - Each costs 250 XP

## Push Notifications

### Notification Types

1. **Daily Engagement Reminder** (Cron: Every Hour)
   - Checks for inactive users (24+ hours)
   - Random message from:
     - "Someone shared a thought today."
     - "Someone might need your perspective."
     - "A question might be waiting for your answer."
     - "A bubble is waiting for you."
     - "Someone is seeking advice on a sensitive topic."

2. **Instant Notifications** (Real-time)
   - Daily login bonus
   - Mission completions
   - Level-ups
   - Streak milestones (7-day, 15-day)
   - Item consumption confirmations

### Implementation

- All push notifications go through `PushTokenService.sendInstantNotification()`
- Graceful error handling prevents notification failures from breaking workflows
- Uses Firebase Admin SDK (ready for integration in `sendToProvider()`)

## Level System

### XP to Level Conversion

- **Formula:** `Level = Math.floor(TotalXP / 100) + 1`
- **Level 1:** 0-99 XP
- **Level 2:** 100-199 XP
- **Level 3:** 200-299 XP
- And so on...

### Level-Up Rewards

- When level increases, 100 credits are added per level gained
- Credits are stored in `UserInventory` with type: `LEVEL_UP_CREDIT`
- User can later spend these on premium features

### Level-Down

- If user spends XP (purchases premium credits), level can decrease
- Each 100 XP decrease = 1 level down
- No notification on level-down (only on level-up)

## Integration Checklist

- ✅ User service: Daily login trigger
- ✅ Streak service: Streak management & milestone notifications
- ✅ Mission service: Mission completion & level-up logic
- ✅ Post service: Content creation tracking
- ✅ Favorite service: Favorite tracking
- ✅ Response service: Response tracking
- ✅ Inventory service: XP spending & level calculation
- ✅ Push-token service: Notification delivery
- ⚠️ **TODO:** Create missions in database
- ⚠️ **TODO:** Test Firebase integration in `sendToProvider()`
- ⚠️ **TODO:** Test all workflows end-to-end

## Testing Recommendations

### Test Case 1: Daily Login Flow

1. User authenticates (app open)
2. Verify: +10 XP awarded
3. Verify: Push notification sent
4. Verify: Streak updated

### Test Case 2: Post Creation

1. User creates 1st post
2. Mission progress tracked (1/3)
3. User creates 2nd post
4. Mission progress tracked (2/3)
5. User creates 3rd post
6. Mission completes: +30 XP
7. Verify: Push notification sent

### Test Case 3: Level-Up

1. User has 50 XP (Level 1)
2. Complete missions to reach 120 XP
3. Verify: Level changed to 2
4. Verify: 100 credits added to inventory
5. Verify: Level-up notification sent

### Test Case 4: XP Spending

1. User has 400 XP (Level 5)
2. Spend 250 XP on premium credit
3. Verify: XP = 150 (Level 2)
4. Verify: Premium credit added to inventory
5. Verify: Level change notification (if applicable)

## Future Enhancements

- Add mission reset logic (reset daily missions at midnight)
- Implement seasonal/weekly missions
- Add mission categories and progression tiers
- Implement badge/achievement system
- Add leaderboard based on XP/streaks
- Consider dynamic mission difficulty based on user level
