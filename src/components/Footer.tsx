export default function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-gradient-to-b from-transparent to-muted/40">

      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-4">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            BirdieFund
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Turn your golf performance into real-world impact.
            Play, compete, and contribute to meaningful causes.
          </p>
        </div>

        {/* PRODUCT */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-foreground transition cursor-pointer">Dashboard</li>
            <li className="hover:text-foreground transition cursor-pointer">Leaderboard</li>
            <li className="hover:text-foreground transition cursor-pointer">Charities</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-foreground transition cursor-pointer">About</li>
            <li className="hover:text-foreground transition cursor-pointer">Transparency</li>
            <li className="hover:text-foreground transition cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Get Started</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join the platform and start making every round count.
          </p>

          <a
            href="/auth/signup"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm shadow-md hover:opacity-90 transition"
          >
            Join Now
          </a>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 BirdieFund. All rights reserved.</p>
        <p className="mt-1 text-xs">
          Play. Win. Give Back.
        </p>
      </div>
    </footer>
  );
}