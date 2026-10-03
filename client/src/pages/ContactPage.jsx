export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-orange-700">
          Contact
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          We’re here to help.
        </h1>
      </header>
      <p className="leading-7 text-slate-600">
        For help with an order or your account, email our support team at
        support@shopsphere.com.
      </p>
      <p className="text-sm text-slate-500">
        Support hours: Monday–Friday, 9:00 AM–5:00 PM.
      </p>
    </section>
  );
}
