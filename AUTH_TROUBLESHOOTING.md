# 🔧 Authentication Troubleshooting

## ❌ Common Errors & Solutions:

### Error: "Unable to validate email address: invalid format"

**Causes:**
1. Email has spaces or invalid characters
2. Email not in correct format
3. Supabase email validation settings

**Solutions:**
- ✅ Email is now auto-trimmed and lowercased
- ✅ Email format validated before sending
- ✅ Regex check: `user@domain.com`

**Test:**
- Use: `test@example.com` ✅
- Not: `test @example.com` ❌
- Not: `test` ❌
- Not: `test@` ❌

---

### Error: "Invalid login credentials"

**Causes:**
1. User doesn't exist (not signed up yet)
2. Wrong password
3. Email case mismatch
4. Email confirmation required

**Solutions:**
- ✅ Email now lowercased automatically
- ✅ Better error messages
- ✅ Check if email confirmation is disabled in Supabase

**Check Supabase Settings:**
1. Go to: https://supabase.com/dashboard/project/ffvgvjymkiaiasfrhqih/auth/settings
2. Find "Enable email confirmations"
3. **Make sure it's OFF** ✅
4. Save

---

## 🧪 Test Authentication:

### Test 1: Sign Up

```
Email: testuser@example.com
Password: password123
Name: Test User
```

**Expected:**
- ✅ Account created
- ✅ Logged in immediately
- ✅ User appears in Supabase Auth
- ✅ User synced to database

**If fails:**
- Check email format (no spaces)
- Check password length (min 6)
- Check Supabase Auth settings

### Test 2: Login

```
Email: testuser@example.com
Password: password123
```

**Expected:**
- ✅ Logged in
- ✅ Session created
- ✅ User synced

**If fails:**
- Make sure you signed up first
- Check email is exact match
- Check password is correct
- Check Supabase Auth users list

---

## 🔍 Debug Steps:

### Step 1: Check Supabase Auth Settings

**Go to:** https://supabase.com/dashboard/project/ffvgvjymkiaiasfrhqih/auth/settings

**Verify:**
- [ ] Email provider is enabled
- [ ] "Enable email confirmations" is **OFF**
- [ ] "Enable sign ups" is **ON**
- [ ] No email templates blocking signup

### Step 2: Check Console Logs

**In your app console, you'll see:**
```
📝 Signing up with: user@example.com
✅ Signup successful
```

Or:
```
❌ Signup error: [error details]
```

### Step 3: Check Supabase Users

**Go to:** https://supabase.com/dashboard/project/ffvgvjymkiaiasfrhqih/auth/users

**Check:**
- [ ] User was created
- [ ] Email is correct
- [ ] Status is active
- [ ] No confirmation required

---

## ✅ Current Configuration:

### Mobile App:
```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Auto-trim and lowercase
const trimmedEmail = email.trim().toLowerCase();

// Better error messages
console.log('📝 Signing up with:', trimmedEmail);
```

### Supabase:
```
URL: https://ffvgvjymkiaiasfrhqih.supabase.co
Anon Key: eyJhbGci... ✅
JWT Secret: VE0Cv3s... ✅
```

---

## 🎯 What to Check:

### If Signup Fails:

1. **Email format**: Must be `user@domain.com`
2. **Password**: Min 6 characters
3. **Supabase settings**: Email confirmation OFF
4. **Console logs**: Check error details

### If Login Fails:

1. **User exists**: Check Supabase Auth users
2. **Email match**: Exact match (case-insensitive now)
3. **Password correct**: Check what you used in signup
4. **Account active**: Not suspended in Supabase

---

## 🚀 Try This:

### Fresh Test:

1. **Sign up** with: `guillaume@test.com` / `password123`
2. **Check console** for logs
3. **Check Supabase** for user
4. **Login** with same credentials
5. ✅ Should work!

---

## 📝 If Still Not Working:

**Share with me:**
1. Exact email you're using
2. Console error logs
3. Supabase Auth settings screenshot

**I'll help debug!** 🔧

---

**Your platform is ready - just need to fix auth!** ✅
