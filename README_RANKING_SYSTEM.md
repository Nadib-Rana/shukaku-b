# Shukaku Ranking, Mission Workflow, and Push Notification System

## 🎯 Overview

A complete gamification system has been implemented in the Shukaku backend to drive user engagement through daily login rewards, mission tracking, level-ups, and push notifications.

**Status:** ✅ **IMPLEMENTATION COMPLETE** - Ready for database setup and testing

## 📚 Documentation Files

| File                          | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| **MISSION_SETUP.md**          | Database setup guide with SQL queries             |
| **IMPLEMENTATION_SUMMARY.md** | Complete technical overview of all changes        |
| **WORKFLOW_REFERENCE.md**     | Detailed workflow diagrams and function reference |
| **VERIFICATION_CHECKLIST.md** | Pre-deployment and testing checklist              |

## 🚀 Quick Start

### 1. Setup Database Missions (Required)

Execute the SQL commands in `MISSION_SETUP.md` or run:

```bash
# Using Prisma migration
bun prisma migrate dev --name init_missions
```

This creates 6 required missions:

- `daily_login` - +10 XP
- `create_3_posts` - +30 XP
- `add_3_favorites` - +15 XP
- `add_3_responses` - +15 XP
- `7_day_streak` - +50 XP
- `15_day_streak` - +100 XP

### 2. Test Core Functionality

```bash
# Build project
bun run build

# Run tests
bun test
```

### 3. Deploy

See **VERIFICATION_CHECKLIST.md** for pre-deployment checklist.

## 🎮 Feature Breakdown

### Workflow 1: Daily Engagement (App Open)

When a user opens the app and authenticates:

- ✅ Daily login XP awarded (+10)
- ✅ Streak updated and tracked
- ✅ Push notification sent
- ✅ Milestone check (7-day, 15-day)

**Triggered In:** `UserService.auth()`

### Workflow 2: Content Creation

When a user creates a post/bubble:

- ✅ Post creation tracked toward mission (3 posts = +30 XP)
- ✅ Mission completion checked
- ✅ XP awarded on completion
- ✅ Level-up checked and rewards distributed
- ✅ Push notification sent

**Triggered In:** `PostService.create()`

### Workflow 3: Community Support - Favorites

When a user adds a favorite:

- ✅ Favorite tracked toward mission (3 favorites = +15 XP)
- ✅ Mission completion checked
- ✅ Same rewards as Workflow 2

**Triggered In:** `FavoriteService.toggleFavorite()`

### Workflow 4: Community Support - Responses

When a user creates a response/comment:

- ✅ Response tracked toward mission (3 responses = +15 XP)
- ✅ Mission completion checked
- ✅ Same rewards as Workflow 2

**Triggered In:** `ResponseService.create()`

### Workflow 5: Long-Term Engagement

When a user reaches streak milestones:

- ✅ 7-day streak: +50 XP + special notification
- ✅ 15-day streak: +100 XP + special notification
- ✅ Level-up logic triggered
- ✅ Credits awarded if level increased

**Triggered In:** `StreakService.rewardDailyLogin()`

### Workflow 6: Premium Features

When a user spends XP on premium posts:

- ✅ 250 XP cost per premium credit
- ✅ Level recalculation on spending
- ✅ Credits added to inventory
- ✅ Notifications sent on consumption

**Triggered In:** `InventoryService.purchaseCreditWithXp()`

### Workflow 7: Push Notifications

System sends contextual notifications:

- ✅ Daily engagement reminders (hourly cron)
- ✅ Mission completion notifications
- ✅ Level-up notifications
- ✅ Streak milestone notifications
- ✅ Item consumption confirmations

**Triggered In:** Multiple services via `PushTokenService`

## 📊 XP & Level System

### Level Calculation

```
Level = floor(TotalXP / 100) + 1

Examples:
- 0-99 XP → Level 1
- 100-199 XP → Level 2
- 200-299 XP → Level 3
- 400+ XP → Level 5+
```

### Level-Up Rewards

When a user levels up:

- **100 credits** added to inventory per level gained
- Can be used for premium post features
- Cost: 250 XP per premium post

## 🔔 Push Notifications

### Daily Engagement Messages

Sent hourly to users inactive for 24+ hours:

```
"Someone shared a thought today."
"Someone might need your perspective."
"A question might be waiting for your answer."
"A bubble is waiting for you."
"Someone is seeking advice on a sensitive topic."
```

### Real-Time Notifications

- **Daily Login:** "Daily login bonus! You earned +10 XP."
- **Mission Complete:** "🎉 Mission '{title}' completed! You earned +{xp} XP."
- **Level-Up:** "⭐ Level Up! You reached Level {level}. Credits added!"
- **7-Day Streak:** "🔥 7-day streak achieved! You earned +50 XP."
- **15-Day Streak:** "🔥 15-day streak achieved! You earned +100 XP."
- **Item Used:** "Used 1x {itemType}. Remaining: {qty}"

## 📁 Modified Files

### Core Services

1. **src/user/user.service.ts** - Daily login trigger
2. **src/streak/streak.service.ts** - Streak management
3. **src/mission/mission.service.ts** - Mission completion & level-up
4. **src/post/post.service.ts** - Post tracking
5. **src/favorite/favorite.service.ts** - Favorite tracking
6. **src/response/response.service.ts** - Response tracking
7. **src/inventory/inventory.service.ts** - XP spending & credits
8. **src/push-token/push-token.service.ts** - Notifications (enhanced)

### Documentation

- **MISSION_SETUP.md** - Setup guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **WORKFLOW_REFERENCE.md** - Workflow diagrams
- **VERIFICATION_CHECKLIST.md** - Testing checklist
- **prisma/migrations/20260226_init_missions/migration.sql** - Database migration

## 🔗 Dependency Injection

Services are properly interconnected with circular dependency management:

```
UserService
  ├─ StreakService
  └─ PushTokenService

StreakService
  ├─ MissionService
  └─ PushTokenService

MissionService
  ├─ PushTokenService
  └─ InventoryService

PostService
  └─ MissionService

FavoriteService
  └─ MissionService

ResponseService
  └─ MissionService

InventoryService
  └─ PushTokenService
```

## 🛡️ Error Handling

- All push notifications wrapped in try-catch
- Notification failures don't interrupt main workflows
- Errors logged for debugging
- Transaction safety for XP/level operations
- Graceful degradation

## 🧪 Testing

### Minimal Test Case

```typescript
// 1. User opens app
const user = await userService.auth('device-123');
// Expect: +10 XP, push notification

// 2. User creates post
const post = await postService.create(user.id, { categoryId, content });
// Expect: Mission tracked (1/3)

// 3. Create 2 more posts
// ...
// Expect: Mission complete on 3rd post, +30 XP, level-up check

// 4. Verify inventory
const inventory = await inventoryService.getMyInventory(user.id);
// Expect: New level credits if leveled up
```

### Full Test Suite

See **VERIFICATION_CHECKLIST.md** for comprehensive test scenarios.

## 🚀 Deployment Steps

1. **Backup Database**

   ```bash
   # Create database backup
   ```

2. **Apply Database Migration**

   ```bash
   bun prisma migrate dev
   # Creates required missions
   ```

3. **Build Project**

   ```bash
   bun run build
   # Verify no compilation errors
   ```

4. **Run Tests**

   ```bash
   bun test
   # Verify all tests pass
   ```

5. **Deploy**

   ```bash
   # Deploy to production
   ```

6. **Monitor**
   - Watch for mission tracking errors
   - Monitor XP/level calculations
   - Check push notification delivery
   - Monitor system performance

## 📈 Metrics to Track

- **User Engagement**
  - Daily login rate
  - Average daily active users (DAU)
  - Session frequency

- **Mission Progress**
  - Mission completion rate
  - Average XP earned per user/day
  - Time to complete missions

- **Monetization**
  - Premium post purchases
  - Credit spending rate
  - Average XP per user at different levels

- **System Health**
  - Push notification delivery rate
  - Error rates in mission tracking
  - Level-up frequency
  - Streak retention

## 🔮 Future Enhancements

1. **Mission Scheduling**
   - Daily mission resets at midnight
   - Weekly mission rotations
   - Seasonal missions

2. **Difficulty Scaling**
   - Dynamic mission requirements based on level
   - Adaptive XP rewards

3. **Achievement System**
   - Badges for milestones
   - Achievement tracking
   - Achievement showcase

4. **Leaderboards**
   - XP-based ranking
   - Streak leaderboards
   - Weekly challenges

5. **Social Features**
   - Compare stats with friends
   - Group challenges
   - Cooperative missions

6. **Advanced Premium Features**
   - Multiple premium post types
   - Power-ups and boosters
   - Gift system
   - VIP rewards

## 💡 Pro Tips

### For Product Teams

- Monitor mission completion rates to identify engagement issues
- A/B test different XP reward values
- Use leaderboards to drive competitive engagement
- Consider seasonal missions for fresh content

### For Backend Teams

- Set up alerts for mission tracking errors
- Monitor XP calculation consistency
- Track push notification delivery rates
- Regular backups recommended

### For Frontend Teams

- Display XP progress bar toward next level
- Show mission progress in-app
- Display earned credits in inventory
- Show push notification opt-in UI

## 📞 Support

For questions or issues:

1. Check **WORKFLOW_REFERENCE.md** for detailed flows
2. Review **VERIFICATION_CHECKLIST.md** for testing help
3. Check error logs for specific errors
4. Review service files for implementation details

## 📝 License & Credits

Implementation Date: February 26, 2026
All workflows and features implemented according to specification.

---

**Ready to gamify your user experience! 🎮✨**
