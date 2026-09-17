import { generateStocks } from "@/lib/mock-data";
import DashboardShell from "@/components/DashboardShell";

export default function Home() {
  const stocks = generateStocks();
  return <DashboardShell stocks={stocks} />;
}
