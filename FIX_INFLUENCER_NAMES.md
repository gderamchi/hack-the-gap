# 🔧 Fix Influencer Names - Use Well-Known Public Names

## ✅ Already Fixed:

- ✅ **Thom Astro** → **Thomas Pesquet** (astronaut, science)

---

## 📋 How to Review and Fix Names

### Step 1: Export All Names

```bash
cd mobile-app/backend
sqlite3 prisma/dev.db "SELECT name, niche FROM Influencer ORDER BY name;" > all_names.txt
```

### Step 2: Review the List

Open `all_names.txt` and check if names match their **most well-known public identity**.

### Step 3: Fix Individual Names

For each wrong name, run:

```bash
sqlite3 prisma/dev.db "UPDATE Influencer SET name = 'Correct Name' WHERE name = 'Wrong Name';"
```

### Step 4: Fix Duplicates

If you find duplicates (same person, different names):

```bash
# Delete the duplicate with lower score
sqlite3 prisma/dev.db "DELETE FROM Influencer WHERE id = 'duplicate-id';"

# Rename the one you keep
sqlite3 prisma/dev.db "UPDATE Influencer SET name = 'Correct Name' WHERE id = 'keep-id';"
```

---

## 🎯 Guidelines for Correct Names

### Use the name they're MOST KNOWN BY:

✅ **Squeezie** (not "Lucas Hauchard")
✅ **Norman** (not "Norman Thavaud")
✅ **Cyprien** (not "Cyprien Iov")
✅ **McFly et Carlito** (not their real names)
✅ **Tibo InShape** (not "Thibaud Delapart")
✅ **EnjoyPhoenix** (not "Marie Lopez")
✅ **Natoo** (not "Nathalie Odzierejko")
✅ **Thomas Pesquet** (not "Thom Astro") ← Fixed!
✅ **Michou** (already correct)
✅ **Gotaga** (not "Corentin Houssein")

### For musicians/artists:
✅ Use their **stage name** (PLK, Ninho, etc.)

### For brands/channels:
✅ Use the **channel name** (Scilabus, Bon Pote, etc.)

---

## 🔍 Common Issues to Look For:

### 1. Social Media Handles Instead of Names
❌ `@username` or `username_insta`
✅ `Real Name` or `Stage Name`

### 2. Real Names Instead of Stage Names
❌ `Lucas Hauchard`
✅ `Squeezie`

### 3. Parenthetical Handles
❌ `Thomas Pesquet (thom_astro)`
✅ `Thomas Pesquet`

### 4. Duplicates
❌ Multiple entries for same person
✅ One entry with best data

---

## 🛠️ Quick Fix Script

Create a file `fix-all-names.sql` with all corrections:

```sql
-- Gaming
UPDATE Influencer SET name = 'Norman' WHERE name LIKE '%Norman%' AND name != 'Norman';
UPDATE Influencer SET name = 'Cyprien' WHERE name LIKE '%Cyprien%' AND name != 'Cyprien';

-- Beauty
UPDATE Influencer SET name = 'EnjoyPhoenix' WHERE name LIKE '%Marie Lopez%' OR name LIKE '%enjoyphoenix%';
UPDATE Influencer SET name = 'Natoo' WHERE name LIKE '%Nathalie%' AND niche = 'Comedy';

-- Fitness
UPDATE Influencer SET name = 'Tibo InShape' WHERE name LIKE '%Thibaud%' OR name LIKE '%tiboinshape%';

-- Add more as needed...
```

Then run:
```bash
sqlite3 prisma/dev.db < fix-all-names.sql
```

---

## 📊 Verify Changes

After fixing, verify:

```bash
# Check top influencers
sqlite3 prisma/dev.db "SELECT name, niche, trustScore FROM Influencer ORDER BY trustScore DESC LIMIT 20;"

# Search for specific names
sqlite3 prisma/dev.db "SELECT name FROM Influencer WHERE name LIKE '%search%';"

# Check for duplicates
sqlite3 prisma/dev.db "SELECT name, COUNT(*) as count FROM Influencer GROUP BY name HAVING count > 1;"
```

---

## 🔄 After Fixing Names

### Restart Backend (if running)
```bash
# The backend will pick up the database changes automatically
# But if you want to be sure:
cd mobile-app/backend
npm run dev
```

### Refresh Mobile App
- Pull down to refresh on any screen
- Or restart the app

---

## 📝 Example: Full Fix Script

Here's a template for fixing multiple names at once:

```sql
-- Science/Education
UPDATE Influencer SET name = 'Thomas Pesquet' WHERE name = 'Thom Astro';
UPDATE Influencer SET name = 'Bruce Benamran' WHERE name LIKE '%e-penser%';

-- Gaming
UPDATE Influencer SET name = 'Squeezie' WHERE name LIKE '%Lucas Hauchard%';
UPDATE Influencer SET name = 'Gotaga' WHERE name LIKE '%Corentin%';

-- Comedy
UPDATE Influencer SET name = 'Norman' WHERE name LIKE '%Norman Thavaud%';
UPDATE Influencer SET name = 'Cyprien' WHERE name LIKE '%Cyprien Iov%';

-- Beauty/Lifestyle
UPDATE Influencer SET name = 'EnjoyPhoenix' WHERE name LIKE '%Marie Lopez%';
UPDATE Influencer SET name = 'Natoo' WHERE name LIKE '%Nathalie Odz%';

-- Fitness
UPDATE Influencer SET name = 'Tibo InShape' WHERE name LIKE '%Thibaud Delapart%';

-- Delete duplicates (keep highest score)
DELETE FROM Influencer WHERE name = 'Duplicate Name' AND trustScore < 50;

-- Verify
SELECT name, niche, trustScore FROM Influencer ORDER BY trustScore DESC LIMIT 30;
```

---

## ✅ Current Status:

- ✅ **Thomas Pesquet** - Fixed!
- ✅ **Squeezie** - Already correct
- ✅ **Michou** - Already correct
- ✅ **Tibo InShape** - Already correct
- ✅ **Gotaga** - Already correct

**Review the rest and fix as needed!**

---

## 🎯 Quick Test:

After fixing names:

1. Refresh the app
2. Search for "Thomas Pesquet"
3. ✅ Should find him (not "Thom Astro")
4. ✅ Should have score 99
5. ✅ Should show correct profile

---

**Need to fix more names? Just create a SQL script and run it!** 🚀
