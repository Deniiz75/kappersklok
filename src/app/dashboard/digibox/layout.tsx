export default function DigiboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-auto">
      {children}
    </div>
  );
}
