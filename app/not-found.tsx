// app/not-found.tsx

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <p style={{ fontSize: "0.8rem", textTransform: "uppercase", opacity: 0.6 }}>
          404 – Page not found
        </p>
        <h1 style={{ fontSize: "2rem", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
          This page has wandered off the map.
        </h1>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          We can’t find what you’re looking for. Try heading back to the homepage.
        </p>
      </div>
    </main>
  );
}
