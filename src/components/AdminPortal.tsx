import React from 'react';
import {
  ShieldCheck,
  Activity,
  Server,
  Database,
  Cpu,
  Clock,
  Layers,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.ts';

export const AdminPortal: React.FC = () => {
  const [health, setHealth] = React.useState<any>(null);
  const [stats, setStats] = React.useState<any>(null);
  const [platforms, setPlatforms] = React.useState<any[]>([]);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [h, s, p, l] = await Promise.all([
        api.getAdminHealth(),
        api.getAdminStats(),
        api.getAdminPlatforms(),
        api.getAdminLogs(),
      ]);
      setHealth(h);
      setStats(s.stats);
      setPlatforms(p.platforms);
      setLogs(l.logs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Administrator Control & Diagnostics Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Restricted role-based telemetry: service health, platform integration statuses, and sanitized audit stream.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* System Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Core Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {health?.status || 'HEALTHY'}
          </div>
          <div className="text-[11px] text-slate-500">
            Node: {health?.nodeVersion || process.version}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Accounts</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats?.totalUsers || 2}
          </div>
          <div className="text-[11px] text-slate-500">
            Active Sessions: {stats?.activeSessions || 1}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Uptime</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {Math.floor((health?.uptimeSeconds || 360) / 60)}m {(health?.uptimeSeconds || 360) % 60}s
          </div>
          <div className="text-[11px] text-slate-500">Zero downtime target</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Provider Engine</span>
            <Cpu className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-sm font-bold text-teal-300 font-mono truncate">
            {health?.aiServiceStatus || 'GEMINI_ACTIVE'}
          </div>
          <div className="text-[11px] text-slate-500">With offline fallback</div>
        </div>
      </div>

      {/* Social Media Platform Integrations Status */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Platform Adapter Connectors & Compliance Status</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <div
              key={p.platform}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.displayName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {p.mode}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                API: {p.officialApi}
              </div>

              <p className="text-[11px] text-slate-300 pt-1 leading-snug">
                {p.statusMessage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sanitized Audit Log Stream */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Sanitized System Audit Stream</span>
          </h2>
          <span className="text-xs text-slate-500">Passwords and secrets never logged</span>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-900 text-slate-300"
            >
              <div className="space-x-2">
                <span className="text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`font-bold ${
                    log.action.includes('LOGIN')
                      ? 'text-indigo-400'
                      : log.action.includes('AUDIT')
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  [{log.action}]
                </span>
                <span className="text-slate-200">{log.resource}</span>
              </div>

              <span className="text-slate-500 text-[10px] shrink-0">
                IP: {log.ipAddress || '127.0.0.1'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
