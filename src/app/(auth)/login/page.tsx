import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { SocialButtons } from '../SocialButtons';

export const metadata = { title: 'Sign in' };

export default async function LoginPage(props: { searchParams: Promise<{ next?: string; message?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-[15px] text-slate">
        New here? <Link href="/register" className="font-semibold text-signal hover:underline">Create an account</Link>
      </p>
      <SocialButtons next={searchParams.next} />
      <LoginForm next={searchParams.next} message={searchParams.message} />
    </>
  );
}


