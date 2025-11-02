# 📧 EmailJS Setup Guide (বাংলায়)

## ✅ Current Status

Contact form এখন **partially working** আছে demo configuration দিয়ে। 

কিন্তু **proper setup** করলে:
- ✅ Direct email তোমার inbox এ আসবে
- ✅ 200 emails/month free
- ✅ Professional service
- ✅ No "via backup service" message

---

## 🚀 Setup করো (5 মিনিট)

### Step 1: EmailJS Account তৈরি করো

1. যাও: https://www.emailjs.com/
2. **Sign Up** এ click করো
3. **Google** দিয়ে sign up করো (সহজ)
4. Email verify করো

---

### Step 2: Email Service যোগ করো

1. Dashboard এ যাও
2. **Email Services** tab এ click করো
3. **Add New Service** button এ click করো
4. **Gmail** select করো
5. **Connect Account** এ click করো
6. তোমার Gmail account select করো: `mdakhinoorislam.official.2005@gmail.com`
7. **Allow** করো all permissions
8. **Service ID** copy করো (যেমন: `service_abc123`)

---

### Step 3: Email Template তৈরি করো

1. **Email Templates** tab এ যাও
2. **Create New Template** button এ click করো
3. Template name দাও: `Portfolio Contact Form`

4. **Template Content** এ এটা paste করো:

```
Subject: Portfolio Contact: {{subject}}

Hello Akhinoor,

You have received a new message from your portfolio contact form.

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This email was sent from your portfolio contact form.
Reply to: {{from_email}}
```

5. **Test it** button এ click করো test করার জন্য
6. **Save** করো
7. **Template ID** copy করো (যেমন: `template_xyz789`)

---

### Step 4: Public Key নাও

1. **Account** menu তে যাও
2. **General** tab select করো
3. **Public Key** copy করো (যেমন: `puw9DZLbKZH_3Mz8h`)

---

### Step 5: contact.html Update করো

`contact.html` file খোলো এবং এই 3 জায়গায় তোমার values paste করো:

#### Line ~168: Public Key

```javascript
// আগে:
emailjs.init('puw9DZLbKZH_3Mz8h'); // Demo key

// পরে (তোমার key paste করো):
emailjs.init('YOUR_PUBLIC_KEY_HERE');
```

#### Line ~193-194: Service ID & Template ID

```javascript
// আগে:
const response = await emailjs.send(
    'service_kqwxj9j',  // Demo service
    'template_contact', // Demo template

// পরে (তোমার IDs paste করো):
const response = await emailjs.send(
    'service_abc123',  // তোমার Service ID
    'template_xyz789', // তোমার Template ID
```

---

### Step 6: Test করো

1. Website এ যাও: Contact page
2. Form fill করো
3. **Send Message** button এ click করো
4. দেখো:
   - Loading spinner দেখাচ্ছে কিনা
   - Success message আসছে কিনা
   - তোমার Gmail inbox এ email এসেছে কিনা

---

## 🎯 Example Setup

ধরো তোমার values এরকম:

- **Public Key:** `puw9DZLbKZH_3Mz8h`
- **Service ID:** `service_gmail123`
- **Template ID:** `template_contact456`

তাহলে তোমার code হবে:

```javascript
// Line 168
emailjs.init('puw9DZLbKZH_3Mz8h');

// Line 193-194
const response = await emailjs.send(
    'service_gmail123',
    'template_contact456',
    {
        from_name: data.from_name,
        from_email: data.from_email,
        subject: data.subject,
        message: data.message,
        to_email: 'mdakhinoorislam.official.2005@gmail.com'
    }
);
```

---

## 🔥 Features

### ✅ কি কাজ করছে এখনই:

1. **EmailJS primary service** - Demo config দিয়ে
2. **Web3Forms backup** - যদি EmailJS fail করে
3. **Mailto fallback** - যদি উপরের দুটো fail করে
4. **Loading states** - Spinner animation
5. **Success/error messages** - User feedback
6. **Form validation** - All fields required
7. **Auto reset** - Form clears after send

### 🎨 User Experience:

1. User form fill করে
2. Submit button এ click করে
3. **"Sending..."** spinner দেখায়
4. Email send হয়
5. **"✅ Message sent successfully!"** দেখায়
6. Form automatically clear হয়ে যায়
7. তুমি email পাও তোমার inbox এ

---

## 🎁 Free Tier Limits

EmailJS Free Plan:
- ✅ **200 emails/month** (portfolio এর জন্য যথেষ্ট)
- ✅ **2 email services**
- ✅ **Unlimited templates**
- ✅ **Email support**
- ✅ **No credit card required**

এটা একটা portfolio website এর জন্য perfect! 🎉

---

## 🐛 Troubleshooting

### Problem: Email পাচ্ছি না

**Solution:**
1. Gmail inbox check করো
2. **Spam folder** check করো
3. EmailJS dashboard এ **History** tab check করো
4. Template variables ঠিক আছে কিনা check করো

### Problem: "Service unavailable" error

**Solution:**
1. Public Key ঠিক আছে কিনা check করো
2. Service ID ঠিক আছে কিনা check করো
3. Template ID ঠিক আছে কিনা check করো
4. Internet connection check করো

### Problem: Template not working

**Solution:**
1. Template variables এরকম আছে কিনা: `{{from_name}}`, `{{message}}`
2. Template save করেছো কিনা
3. Template ID ঠিক copy করেছো কিনা

---

## 📱 Mobile Testing

Mobile device থেকে test করার সময়:

1. ✅ Form fill করা যাচ্ছে কিনা
2. ✅ Keyboard ঠিকমতো আসছে কিনা
3. ✅ Submit button click করা যাচ্ছে কিনা
4. ✅ Success message দেখা যাচ্ছে কিনা
5. ✅ Quick action buttons কাজ করছে কিনা

---

## 💡 Pro Tips

1. **Email Template Customize করো:**
   - Add company logo
   - Change colors
   - Add footer

2. **Auto-reply Setup করো:**
   - User কে confirmation email পাঠাও
   - Professional লাগে

3. **Analytics Enable করো:**
   - EmailJS dashboard এ দেখো কতজন message পাঠাচ্ছে
   - Monthly reports পাও

4. **Test করো Different Devices এ:**
   - Desktop browser
   - Mobile browser
   - Different email clients

---

## 🎯 Next Steps

1. ✅ EmailJS account তৈরি করো (5 min)
2. ✅ Service & Template setup করো (3 min)
3. ✅ Keys copy করো (1 min)
4. ✅ contact.html update করো (1 min)
5. ✅ Test করো (1 min)

**Total time: ~10 minutes** 🚀

---

## 🔒 Security

- ✅ **Public Key** public থাকতে পারে (no problem)
- ✅ **Service ID** public থাকতে পারে
- ✅ **Template ID** public থাকতে পারে
- ✅ EmailJS automatically prevents spam
- ✅ Rate limiting built-in
- ✅ CAPTCHA support available

---

## 📞 Current Fallback System

যদি EmailJS setup না করো, তাহলেও form কাজ করবে:

1. **Web3Forms backup** try করবে
2. যদি সেটাও fail করে, **mailto link** দেখাবে
3. User email client দিয়ে পাঠাতে পারবে

কিন্তু **proper setup করা better** কারণ:
- ✅ Professional লাগে
- ✅ Direct inbox এ আসে
- ✅ Tracking করতে পারো
- ✅ Auto-reply করতে পারো

---

**Setup করে ফেলো! 10 minutes এ complete portfolio contact system ready! 🎉**

Need help? Test করতে problem? বলো, আমি help করবো! 💪
