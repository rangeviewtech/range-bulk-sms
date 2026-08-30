import { redirect } from 'next/navigation';

export default function TwoFactorPage() {
  redirect('/2fa/challenge');
}
