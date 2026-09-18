# Tarek Store — تطبيق الموبايل (Expo / React Native)

تطبيق موبايل يتصل بنفس الـ API الخاص بموقع Next.js عبر مصادقة JWT (Bearer token).

## التشغيل

```bash
cd mobile
npm install
cp .env.example .env   # عدّل EXPO_PUBLIC_API_URL
npm start
```

`EXPO_PUBLIC_API_URL` يجب أن يشير إلى عنوان الموقع، مثل `http://192.168.1.10:3000`
عند التجربة على جهاز حقيقي (لا يعمل `localhost` من داخل الجهاز/المحاكي).

## الشاشات

| الشاشة | نقطة الـ API |
| --- | --- |
| تسجيل الدخول / التسجيل | `POST /api/mobile/login`, `POST /api/auth/register` |
| المتجر وتفاصيل المنتج | `GET /api/products` |
| السلة والشراء | `POST /api/orders` |
| المحفظة والشحن | `GET /api/wallet`, `POST /api/redeem` |
| حسابي والطلبات | `GET /api/mobile/me`, `GET /api/orders` |
| خدمة العملاء | `GET/POST /api/support/tickets`, `GET/POST /api/support/tickets/:id/messages` |

يُخزَّن التوكن في `expo-secure-store` ويُرسل في ترويسة `Authorization: Bearer <token>`.
