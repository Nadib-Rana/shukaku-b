# Workflow Quick Reference

## Workflow 1: Daily Engagement (App Open)

```
User Opens App
    ↓
auth() in user.service.ts
    ↓
handleDailyLogin() in streak.service.ts
    ↓
Check lastLoginDate & Calculate Streak
    ↓
If consecutive day: streak++ | If gap: streak=1
    ↓
Update user.lastActiveAt
    ↓
rewardDailyLogin()
    ↓
user.currentXp += 10
    ↓
trackProgress('daily_login') → Mission +10 XP
    ↓
sendInstantNotification(): "Daily login bonus! You earned +10 XP."
    ↓
Check Milestones
    ├─→ If streak === 7: trackProgress('7_day_streak') → +50 XP + notification
    └─→ If streak === 15: trackProgress('15_day_streak') → +100 XP + notification
```

## Workflow 2: Content Creation (Post)

```
User Creates Post
    ↓
create() in post.service.ts
    ↓
Validate user & subscription
    ↓
Upload voice (if applicable)
    ↓
Create post in database
    ↓
trackProgress('create_3_posts') in mission.service.ts
    ↓
currentCount++
    ↓
if (currentCount === 3 && !isCompleted):
    ├─→ completeMission()
    ├─→ mark isCompleted = true
    ├─→ user.currentXp += 30
    ├─→ calculateLevel() → update level if needed
    ├─→ if (newLevel > oldLevel): Add 100 credits to inventory
    ├─→ sendInstantNotification(): "🎉 Mission completed! +30 XP"
    └─→ if (levelUp): sendInstantNotification(): "⭐ Level Up!"
```

## Workflow 3: Community Support (Favorite)

```
User Adds Favorite
    ↓
toggleFavorite() in favorite.service.ts
    ↓
Check if favorite exists
    ├─→ If exists: Delete & return {favorited: false}
    └─→ If not: Create new favorite
        ↓
        Create notification for post owner
        ↓
        trackProgress('add_3_favorites')
        ↓
        if (currentCount === 3 && !isCompleted):
            ├─→ completeMission() → +15 XP
            ├─→ calculateLevel() → update if needed
            ├─→ sendInstantNotification(): Mission & level-up
            └─→ return {favorited: true}
```

## Workflow 4: Community Support (Response)

```
User Creates Response
    ↓
create() in response.service.ts
    ↓
Validate post exists
    ↓
Determine visibility (hidden by default if post requires it)
    ↓
Create response in database
    ↓
Send notification to post owner or parent responder
    ↓
trackProgress('add_3_responses')
    ↓
if (currentCount === 3 && !isCompleted):
    ├─→ completeMission() → +15 XP
    ├─→ calculateLevel() → update if needed
    ├─→ sendInstantNotification(): Mission & level-up
    └─→ return response
```

## Workflow 5: Daily Mission Completion

```
trackProgress() Completes Mission
    ↓
completeMission() in mission.service.ts
    ↓
Mark userMissionProgress.isCompleted = true
    ↓
Fetch current user
    ↓
Calculate newXp = currentXp + xpReward
    ↓
Calculate newLevel = floor(newXp / 100) + 1
    ↓
Update user: {currentXp: newXp, level: newLevel}
    ↓
Check level change
    ├─→ if (newLevel > oldLevel):
    │   ├─→ Calculate levelDifference
    │   ├─→ Add (100 * levelDifference) credits to inventory
    │   └─→ sendInstantNotification(): "⭐ Level Up!"
    └─→ sendInstantNotification(): "🎉 Mission completed! +{xp} XP"
```

## Workflow 6: Long-Term Engagement (Streak Milestones)

```
Daily Login Check
    ↓
Streak Update
    ↓
If streak === 7:
    ├─→ trackProgress('7_day_streak')
    ├─→ completeMission() → +50 XP
    ├─→ calculateLevel() if needed
    └─→ sendInstantNotification(): "🔥 7-day streak! +50 XP"

If streak === 15:
    ├─→ trackProgress('15_day_streak')
    ├─→ completeMission() → +100 XP
    ├─→ calculateLevel() if needed
    └─→ sendInstantNotification(): "🔥 15-day streak! +100 XP"
```

## Workflow 7: Premium Feature Purchase (XP Spending)

```
User Purchases Premium Credit
    ↓
purchaseCreditWithXp() in inventory.service.ts
    ↓
Validate user has 250+ XP
    ↓
Calculate newXp = currentXp - 250
    ↓
Calculate newLevel = floor(newXp / 100) + 1
    ↓
Update user: {currentXp: newXp, level: newLevel}
    ↓
Add credit to inventory: {itemType, quantity++}
    ↓
Check level change
    ├─→ if (newLevel < oldLevel):
    │   └─→ Level decrease (no notification)
    ├─→ if (newLevel > oldLevel):
    │   └─→ sendInstantNotification(): "⭐ Unexpected level up!"
    └─→ Return {result, newLevel, oldLevel}
```

## Workflow 8: Item Consumption (Use Premium Feature)

```
User Uses Premium Credit
    ↓
consumeItem() in inventory.service.ts
    ↓
Validate inventory has item
    ↓
Decrement quantity by 1
    ↓
sendInstantNotification(): "Used 1x {itemType}. Remaining: {qty}"
    ↓
Return updated inventory item
```

## Workflow 9: Daily Push Notification (Engagement Reminder)

```
Every Hour Cron Job
    ↓
handleEngagementCron() in push-token.service.ts
    ↓
Find users with lastActiveAt < 24 hours ago
    ↓
For each user with pushTokens:
    ├─→ Select random message from dailyMessages
    ├─→ For each push token:
    │   ├─→ sendToProvider(token, message)
    │   └─→ Log: "Push sent to {token}: {message}"
    └─→ Continue to next user
```

## XP & Level Examples

| Total XP | Level | Credits | Notes                          |
| -------- | ----- | ------- | ------------------------------ |
| 0-99     | 1     | -       | Starting level                 |
| 100-199  | 2     | 100     | Level 1 → 2 awards 100 credits |
| 200-299  | 3     | 200     | Level 2 → 3 awards 100 credits |
| 300-399  | 4     | 300     | Level 3 → 4 awards 100 credits |
| 400+     | 5+    | 400+    | Linear progression             |

## Mission Tracking Example

### User Creates Posts (Tracking 'create_3_posts')

```
1st Post Created:
  - missionProgress.currentCount = 1
  - Not completed (1 < 3)
  - No reward yet

2nd Post Created:
  - missionProgress.currentCount = 2
  - Not completed (2 < 3)
  - No reward yet

3rd Post Created:
  - missionProgress.currentCount = 3
  - COMPLETED! (3 === 3)
  - user.currentXp += 30
  - Check level change
  - Send notification
  - Add inventory credits if level up
```

## Push Notification Flow

```
Service Method Completes
    ↓
Try:
    └─→ sendInstantNotification(userId, message)
        ↓
        Find all pushTokens for userId
        ↓
        For each token:
            └─→ sendToProvider(token, message)
                ↓
                Log: "Push sent to {token}: {message}"
                ↓
                [Firebase Admin would send here]
                └─→ Promise.resolve() [temp placeholder]
Catch:
    └─→ console.error() [Don't break workflow]
```

## Dependency Injection Map

```
UserService
    ├─→ StreakService (forwardRef)
    └─→ PushTokenService (forwardRef)

StreakService
    ├─→ MissionService
    └─→ PushTokenService (forwardRef)

MissionService
    ├─→ PushTokenService (forwardRef)
    └─→ InventoryService (forwardRef)

PostService
    └─→ MissionService (forwardRef)

FavoriteService
    └─→ MissionService (forwardRef)

ResponseService
    └─→ MissionService (forwardRef)

InventoryService
    └─→ PushTokenService (forwardRef)

PushTokenService
    └─→ (No dependencies - base service)
```

## Key Functions Reference

| Function                    | Service          | Purpose                     | Reward                        |
| --------------------------- | ---------------- | --------------------------- | ----------------------------- |
| `handleDailyLogin()`        | StreakService    | Daily login tracking        | +10 XP                        |
| `trackProgress()`           | MissionService   | Track mission progress      | Varies                        |
| `completeMission()`         | MissionService   | Complete & reward mission   | Mission XP                    |
| `create()`                  | PostService      | Create post + track mission | +30 XP (if mission completes) |
| `toggleFavorite()`          | FavoriteService  | Add/remove favorite + track | +15 XP (if mission completes) |
| `create()`                  | ResponseService  | Create response + track     | +15 XP (if mission completes) |
| `purchaseCreditWithXp()`    | InventoryService | Spend XP on credits         | -250 XP, +1 credit            |
| `consumeItem()`             | InventoryService | Use premium credit          | -1 credit, notification       |
| `sendInstantNotification()` | PushTokenService | Send real-time notification | N/A (utility)                 |
| `handleEngagementCron()`    | PushTokenService | Send engagement reminders   | N/A (utility)                 |
