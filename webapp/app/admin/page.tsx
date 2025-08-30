import { redirect } from 'next/navigation';

export default function AdminPage() {
  // SSR редирект на дашборд
  redirect('/admin/dashboard');
}



