export const dynamic = "force-dynamic"; 

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold text-highland-ink">Page Not Found</h1>
      <p className="mt-2 text-highland-ink/70">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}