export default function DigiboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#111111] overflow-auto">
      {children}
    </div>
  );
}
