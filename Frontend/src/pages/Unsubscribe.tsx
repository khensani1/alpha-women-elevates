import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submitUnsubscribe = async () => {
    if (!email.trim()) {
      setStatus('error');
      setMessage('No email was provided in the unsubscribe link.');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unsubscribe failed.');
      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  useEffect(() => {
    if (email) submitUnsubscribe();
    else {
      setStatus('error');
      setMessage('No email was provided in the unsubscribe link.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-24 px-4">
      <div className="max-w-lg mx-auto text-center border border-brand-border p-10 bg-brand-luxury/5">
        <h1 className="font-serif text-3xl text-brand-luxury mb-4">Membership Unsubscribe</h1>

        {status === 'loading' && (
          <p className="text-sm text-brand-muted flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Processing your request…
          </p>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
            <p className="text-sm leading-relaxed">{message}</p>
            <p className="text-xs text-brand-muted">
              A cancellation notice has been sent to tershbkgaphola@gmail.com.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto text-red-500" size={40} />
            <p className="text-sm text-red-600">{message}</p>
          </div>
        )}

        <Link
          to="/"
          className="inline-block mt-8 text-[10px] font-bold uppercase tracking-widest text-brand-luxury underline underline-offset-4"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
