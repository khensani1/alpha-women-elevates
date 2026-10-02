import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Award, CheckCircle, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

interface AttendeeReport {
  customer_email: string;
  is_member: boolean;
  paid_events_attended: number;
  free_events_attended: number;
  total_events_attended: number;
}

export function AdminScanner() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState('');
  const [leaderboard, setLeaderboard] = useState<AttendeeReport[]>([]);

  useEffect(() => {
    fetchMetrics();

    // Initialize camera QR scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          await processScanToken(parsed.token || decodedText);
        } catch {
          await processScanToken(decodedText);
        }
      },
      (error) => {
        // quiet scan frame listener
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const processScanToken = async (token: string) => {
    setScanError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/scan-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Scan verification failed.');

      setScanResult(data);
      fetchMetrics(); // Refresh leaderboard
    } catch (err: any) {
      setScanError(err.message);
      setScanResult(null);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance-metrics`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  return (
    <div className="p-6 bg-pink-50 min-h-screen text-neutral-900 space-y-8">
      <h1 className="font-serif text-3xl font-bold text-purple-950 flex items-center gap-2">
        <UserCheck /> Admin Attendance Scanner
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CAMERA SCANNER */}
        <div className="bg-white p-6 rounded border border-neutral-300 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-950 mb-4">
            Scan Event QR Ticket
          </h2>
          <div id="reader" className="w-full"></div>

          {/* Feedback Display */}
          {scanResult && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded text-green-950 space-y-1">
              <p className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle size={18} /> {scanResult.message}
              </p>
              <p className="text-xs">Attendee: <strong>{scanResult.attendee.email}</strong></p>
              <p className="text-xs">
                Status: {scanResult.attendee.isMember ? (
                  <span className="bg-purple-900 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">Member</span>
                ) : (
                  <span className="bg-neutral-300 text-neutral-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Non-Member</span>
                )}
              </p>
            </div>
          )}

          {scanError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-red-950 flex items-center gap-2 text-sm font-bold">
              <AlertTriangle size={18} /> {scanError}
            </div>
          )}
        </div>

        {/* ATTENDANCE & GIFT LEADERBOARD */}
        <div className="bg-white p-6 rounded border border-neutral-300 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-950 mb-4 flex items-center gap-2">
            <Award /> Attendance Gifting Leaderboard
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-300 text-neutral-600 uppercase text-[10px] font-bold">
                  <th className="py-2">Attendee</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-center">Paid</th>
                  <th className="py-2 text-center">Free</th>
                  <th className="py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {leaderboard.map((row, idx) => (
                  <tr key={idx} className="hover:bg-pink-50">
                    <td className="py-2.5 font-bold">{row.customer_email}</td>
                    <td className="py-2.5">
                      {row.is_member ? (
                        <span className="text-[9px] font-bold bg-purple-200 text-purple-950 px-1.5 py-0.5 rounded">MEMBER</span>
                      ) : (
                        <span className="text-[9px] font-bold bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">GUEST</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-bold text-purple-900">{row.paid_events_attended}</td>
                    <td className="py-2.5 text-center font-bold text-neutral-600">{row.free_events_attended}</td>
                    <td className="py-2.5 text-center font-bold text-green-700 bg-green-50">{row.total_events_attended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}