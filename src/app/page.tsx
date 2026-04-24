import Link from "next/link";
import { cookies } from "next/headers";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

const messagesMap: Record<string, typeof arMessages> = { ar: arMessages, en: enMessages, fr: frMessages };

export default function HomePage() {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "ar";
  const validLocale = ["ar", "en", "fr"].includes(locale) ? locale : "ar";
  const t = messagesMap[validLocale] || arMessages;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              {validLocale === "ar"
                ? "متجرك الرقمي الأول"
                : validLocale === "fr"
                ? "Votre première boutique numérique"
                : "Your Digital Store"}
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
              {validLocale === "ar"
                ? "اكتشف مجموعة واسعة من المنتجات والخدمات الرقمية بأفضل الأسعار"
                : validLocale === "fr"
                ? "Découvrez une large gamme de produits et services numériques aux meilleurs prix"
                : "Discover a wide range of digital products and services at the best prices"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store"
                className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-50 transition shadow-lg"
              >
                {t.common.store} →
              </Link>
              <Link
                href="/auth/register"
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition"
              >
                {t.common.register}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {validLocale === "ar"
              ? "لماذا تختار متجرنا؟"
              : validLocale === "fr"
              ? "Pourquoi nous choisir ?"
              : "Why Choose Us?"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🛡️"
              title={
                validLocale === "ar" ? "آمن وموثوق" : validLocale === "fr" ? "Sûr et fiable" : "Safe & Reliable"
              }
              description={
                validLocale === "ar"
                  ? "تسوق بأمان مع نظام محفظة داخلي محمي"
                  : validLocale === "fr"
                  ? "Achetez en toute sécurité avec un portefeuille interne protégé"
                  : "Shop safely with a protected internal wallet system"
              }
            />
            <FeatureCard
              icon="⚡"
              title={
                validLocale === "ar" ? "تسليم فوري" : validLocale === "fr" ? "Livraison instantanée" : "Instant Delivery"
              }
              description={
                validLocale === "ar"
                  ? "احصل على منتجاتك الرقمية فور الشراء"
                  : validLocale === "fr"
                  ? "Recevez vos produits numériques instantanément"
                  : "Get your digital products instantly after purchase"
              }
            />
            <FeatureCard
              icon="🌍"
              title={
                validLocale === "ar" ? "دعم متعدد اللغات" : validLocale === "fr" ? "Support multilingue" : "Multi-Language"
              }
              description={
                validLocale === "ar"
                  ? "واجهة بثلاث لغات مع أسعار بعملتك المحلية"
                  : validLocale === "fr"
                  ? "Interface en 3 langues avec prix en devise locale"
                  : "Interface in 3 languages with prices in your local currency"
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {validLocale === "ar"
              ? "ابدأ التسوق الآن"
              : validLocale === "fr"
              ? "Commencez vos achats maintenant"
              : "Start Shopping Now"}
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            {validLocale === "ar"
              ? "أنشئ حسابك واشحن محفظتك وابدأ بالتسوق"
              : validLocale === "fr"
              ? "Créez votre compte, rechargez votre portefeuille et commencez"
              : "Create your account, recharge your wallet, and start shopping"}
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-50 transition shadow-lg"
          >
            {t.common.register} →
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
