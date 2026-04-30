import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultSettings = [
  // Payment Gateways
  { key: "paypal_enabled", value: "false", label: "بوابة PayPal", group: "payment_gateways" },
  { key: "crypto_enabled", value: "false", label: "بوابة Crypto (CoinPayments)", group: "payment_gateways" },
  { key: "wallet_payment_enabled", value: "true", label: "الدفع بالمحفظة الداخلية", group: "payment_gateways" },
  { key: "manual_payment_enabled", value: "false", label: "الدفع اليدوي (حوالات)", group: "payment_gateways" },
  { key: "telegram_stars_enabled", value: "false", label: "بوابة Telegram Stars", group: "payment_gateways" },

  // User Management
  { key: "registration_enabled", value: "true", label: "تسجيل حسابات جديدة", group: "user_management" },
  { key: "email_verification_required", value: "false", label: "تأكيد البريد الإلكتروني إلزامي", group: "user_management" },
  { key: "telegram_login_enabled", value: "false", label: "تسجيل الدخول عبر تليجرام", group: "user_management" },
  { key: "merchant_system_enabled", value: "false", label: "نظام تاجر جملة", group: "user_management" },

  // Wallet & Redeem
  { key: "redeem_enabled", value: "true", label: "نظام استرداد الأكواد (Redeem)", group: "wallet_redeem" },
  { key: "transfer_enabled", value: "false", label: "تحويل الرصيد بين المستخدمين", group: "wallet_redeem" },
  { key: "withdraw_enabled", value: "false", label: "سحب الرصيد (Withdraw)", group: "wallet_redeem" },
  { key: "registration_bonus_enabled", value: "false", label: "مكافآت التسجيل (Bonus)", group: "wallet_redeem" },
  { key: "registration_bonus_amount", value: "0", label: "قيمة مكافأة التسجيل ($)", group: "wallet_redeem" },

  // Storefront
  { key: "maintenance_mode", value: "false", label: "وضع الصيانة للمتجر", group: "storefront" },
  { key: "show_sales_counter", value: "true", label: "إظهار عداد المبيعات الحقيقي", group: "storefront" },
  { key: "reviews_enabled", value: "true", label: "نظام التقييمات والتعليقات", group: "storefront" },
  { key: "live_purchase_popups", value: "true", label: "إشعارات الشراء الحية (Popups)", group: "storefront" },
  { key: "cashback_enabled", value: "false", label: "نظام كاش باك", group: "storefront" },
  { key: "cashback_percentage", value: "1", label: "نسبة الكاش باك (%)", group: "storefront" },
  { key: "auto_save_shipping_data", value: "true", label: "حفظ بيانات الشحن تلقائياً", group: "storefront" },
  { key: "allow_delete_saved_data", value: "true", label: "السماح بحذف البيانات المحفوظة", group: "storefront" },
  { key: "multi_profile_enabled", value: "true", label: "تعدد الحسابات للبروفايل", group: "storefront" },

  // Tournaments
  { key: "tournaments_registration_enabled", value: "true", label: "التسجيل في البطولات", group: "tournaments" },
  { key: "tournament_results_auto", value: "false", label: "تلقي نتائج المباريات آلياً", group: "tournaments" },
  { key: "leaderboard_enabled", value: "true", label: "لوحة المتصدرين العامة", group: "tournaments" },
  { key: "telegram_tournament_notifications", value: "false", label: "إشعارات تليجرام للبطولات", group: "tournaments" },

  // API & Merchant
  { key: "api_gateway_enabled", value: "false", label: "واجهة برمجة التطبيقات (API)", group: "api_merchant" },
  { key: "webhooks_enabled", value: "false", label: "نظام Webhooks", group: "api_merchant" },
  { key: "auto_currency_update", value: "true", label: "تحديث أسعار العملات تلقائياً", group: "api_merchant" },

  // Notifications
  { key: "email_notifications_enabled", value: "false", label: "إرسال بريد إلكتروني فوري", group: "notifications" },
  { key: "telegram_bot_notifications", value: "false", label: "بوت تليجرام للإشعارات", group: "notifications" },
  { key: "low_stock_alert_threshold", value: "5", label: "حد تنبيه المخزون المنخفض", group: "notifications" },
];

async function main() {
  console.log("Seeding default settings...");

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create default SMTP config if not exists
  const smtpCount = await prisma.smtpConfig.count();
  if (smtpCount === 0) {
    await prisma.smtpConfig.create({
      data: {
        host: "",
        port: 587,
        username: "",
        apiKey: "",
        fromName: "Tarek Store",
        fromEmail: "",
        isActive: false,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
