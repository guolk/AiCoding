import Sidebar from "./Sidebar";
import Header from "./Header";
import Container from "./Container";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Container>{children}</Container>
      </div>
    </div>
  );
}
