export default function FaqPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold text-highland-ink">
        Frequently asked questions
      </h1>
      <div className="space-y-3 text-sm text-highland-ink/80">
        <div>
          <h2 className="font-semibold text-highland-ink">
            How do deposits and balances work?
          </h2>
          <p>
            You can customise this copy. Typically, you might take a percentage deposit on
            booking and the remaining balance a set number of weeks before departure. Use
            this space to clearly explain your policies and timelines.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-highland-ink">
            What&apos;s included in the price?
          </h2>
          <p>
            Replace this with your own inclusions and exclusions: transport, guiding,
            entry fees, meals and accommodation. Make it easy for guests to understand
            exactly what they are paying for.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-highland-ink">
            Can you customise an itinerary for us?
          </h2>
          <p>
            This is a great place to talk about private tours, bespoke experiences and how
            flexible you are with routes, dates and pick-up locations.
          </p>
        </div>
      </div>
    </div>
  );
}