import { GuideForm } from "@/components/admin/GuideForm";

export default function NewGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-highland-ink">Add a guide</h2>
      </div>

      {/* GUIDE FORM */}
      <GuideForm />
    </div>
  );
}