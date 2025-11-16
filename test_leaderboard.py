import database
from leaderboard import LeaderboardManager

# Initialize
db = database.get_db()
lm = LeaderboardManager()

# Create test contributors
c1 = database.get_or_create_contributor(db, "TestUser1", "test1@example.com")
c2 = database.get_or_create_contributor(db, "TestUser2", "test2@example.com")
c3 = database.get_or_create_contributor(db, "TestUser3", "test3@example.com")

print(f"✅ Created {c1.username}, {c2.username}, {c3.username}")

# Test point calculation
points = lm.calculate_points(mentions_count=25, quality_score=0.9, streak_days=3)
print(f"✅ Points calculation test: {points} points")

# Update stats for test users
database.update_contributor_stats(db, c1.id, 50, 0.9)
database.update_contributor_stats(db, c2.id, 35, 0.7)
database.update_contributor_stats(db, c3.id, 20, 0.6)

print("✅ Updated contributor stats")

# Get leaderboard
rankings = database.get_leaderboard(db, 'all', 10)
print(f"✅ Leaderboard retrieved: {len(rankings)} contributors")
for r in rankings:
    print(f"   {r['rank']}. {r['username']}: {r['points']} points")

# Test achievements
achievements = lm.get_contributor_achievements(c1.id)
print(f"✅ Achievements for {c1.username}: {len(achievements)} badges")

print("\n🎉 All tests passed!")
