import { Spinner } from "@/components/ui/spinner";

// Shown inside the dashboard layout while a page's server data loads, so the sidebar stays put.
export default function Loading() {
  return <Spinner />;
}
