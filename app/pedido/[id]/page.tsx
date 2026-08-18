import OrderStatusClient from "./OrderStatusClient";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> }) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  return <OrderStatusClient id={id} token={token} />;
}
