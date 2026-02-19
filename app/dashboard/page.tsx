'use client'
import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type Contact = {
  id: string
  user_id: string
  name: string
  phone: string
  address: string
}

type ToastState = { msg: string; type: 'success' | 'error' }

// ─── Constants & pure helpers ─────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#C8B8E8', '#B8D4C8', '#E8C8B8', '#B8C8E8',
  '#E8D4B8', '#C8E8D4', '#E8B8C8', '#D4C8E8',
]

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function hasValue(s: string | null | undefined): boolean {
  return Boolean(s && s.trim() !== '')
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F5F2ED;
    --surface: #FDFAF6;
    --border: rgba(60,45,30,0.10);
    --ink: #2A2018;
    --ink-2: #7A6E64;
    --ink-3: #B0A89E;
    --accent: #3D6B4F;
    --accent-light: #EAF2EC;
    --accent-hover: #2F5340;
    --danger: #8B2020;
    --danger-light: #FAEAEA;
    --shadow-sm: 0 1px 3px rgba(60,45,30,0.08);
    --shadow-md: 0 4px 16px rgba(60,45,30,0.10);
    --shadow-lg: 0 12px 40px rgba(60,45,30,0.14);
    --radius: 16px;
    --radius-sm: 10px;
    --mobile-nav-h: 64px;
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); }

  /* ── Desktop shell ───────────────────────────────────────────────────────── */
  .shell { min-height: 100vh; display: grid; grid-template-columns: 272px 1fr; }

  /* Sidebar */
  .sidebar {
    background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 32px 0;
    position: sticky; top: 0; height: 100vh; overflow: hidden;
  }
  .sidebar-logo { padding: 0 24px 28px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
  .logo-mark { width: 34px; height: 34px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-mark svg { color: white; }
  .logo-text { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; }
  .sidebar-section { padding: 24px 16px 0; flex: 1; }
  .sidebar-label { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-3); margin-bottom: 10px; padding: 0 8px; }
  .sidebar-nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm);
    font-size: 13.5px; font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
    margin-bottom: 2px; border: none; background: none; width: 100%; text-align: left;
  }
  .sidebar-nav-item.active { background: var(--accent-light); color: var(--accent); }
  .sidebar-nav-item:hover:not(.active) { background: rgba(60,45,30,0.05); }
  .sidebar-nav-item svg { opacity: 0.65; flex-shrink: 0; }
  .sidebar-nav-item.active svg { opacity: 1; }
  .nav-badge { margin-left: auto; background: var(--accent-light); color: var(--accent); font-size: 11px; font-weight: 500; padding: 2px 7px; border-radius: 20px; }
  .sidebar-footer { padding: 16px 16px 0; border-top: 1px solid var(--border); margin-top: auto; display: flex; flex-direction: column; gap: 6px; }
  .user-chip { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); background: rgba(60,45,30,0.04); }
  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: white; flex-shrink: 0; }
  .user-info { flex: 1; min-width: 0; }
  .user-email { font-size: 11.5px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-label { font-size: 10px; color: var(--ink-3); margin-bottom: 1px; }
  .btn-signout { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border-radius: var(--radius-sm); border: none; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-3); transition: all 0.15s; text-align: left; }
  .btn-signout:hover { background: var(--danger-light); color: var(--danger); }
  .btn-signout.loading { opacity: 0.5; pointer-events: none; }

  /* Main */
  .main { display: flex; flex-direction: column; min-height: 100vh; }
  .topbar { padding: 32px 40px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
  .page-heading { font-family: 'Fraunces', serif; font-size: 38px; font-weight: 400; color: var(--ink); letter-spacing: -1.2px; line-height: 1; }
  .page-sub { font-size: 13px; color: var(--ink-3); margin-top: 6px; }
  .topbar-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-wrap svg { position: absolute; left: 12px; color: var(--ink-3); pointer-events: none; }
  .search-input { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 16px 10px 36px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); outline: none; width: 210px; transition: border-color 0.2s, box-shadow 0.2s; }
  .search-input::placeholder { color: var(--ink-3); }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(61,107,79,0.10); }

  /* Buttons */
  .btn-primary { background: var(--accent); color: white; border: none; border-radius: var(--radius-sm); padding: 10px 18px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.15s, transform 0.1s; white-space: nowrap; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-primary:active { transform: scale(0.97); }
  .btn-primary:disabled { opacity: 0.6; pointer-events: none; }
  .btn-secondary { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-2); cursor: pointer; transition: background 0.15s; }
  .btn-secondary:hover { background: rgba(60,45,30,0.05); }
  .btn-ghost { background: none; border: none; color: var(--ink-3); cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s, background 0.15s; display: flex; align-items: center; gap: 4px; font-family: 'DM Sans', sans-serif; font-size: 12px; }
  .btn-ghost:hover { color: var(--ink); background: rgba(60,45,30,0.06); }

  /* Content */
  .content { padding: 28px 40px 48px; flex: 1; }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; box-shadow: var(--shadow-sm); }
  .stat-label { font-size: 10px; font-weight: 500; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
  .stat-value { font-family: 'Fraunces', serif; font-size: 34px; font-weight: 300; color: var(--ink); letter-spacing: -1px; line-height: 1; }
  .stat-hint { font-size: 12px; color: var(--ink-3); margin-top: 5px; }

  /* Add form */
  .add-form-wrap { background: var(--surface); border: 1px solid var(--accent); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; box-shadow: 0 0 0 4px rgba(61,107,79,0.06), var(--shadow-md); animation: slideDown 0.22s cubic-bezier(0.16,1,0.3,1); }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .form-heading { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 400; color: var(--ink); margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .field-wrap { display: flex; flex-direction: column; gap: 5px; }
  .field-label { font-size: 10px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: var(--ink-3); }
  .field-input { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 13px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .field-input::placeholder { color: var(--ink-3); }
  .field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(61,107,79,0.10); }
  .form-actions { display: flex; gap: 8px; justify-content: flex-end; }

  /* Contacts */
  .contacts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .contacts-title { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-3); }
  .contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }

  /* Contact card */
  .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; min-height: 82px; box-shadow: var(--shadow-sm); display: flex; gap: 14px; align-items: center; animation: fadeIn 0.3s ease both; position: relative; transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .contact-card:hover { box-shadow: var(--shadow-md); border-color: rgba(61,107,79,0.18); transform: translateY(-1px); }
  .contact-card:hover .card-actions { opacity: 1; }
  .contact-avatar { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; color: #3A2E24; flex-shrink: 0; font-family: 'Fraunces', serif; }
  .contact-info { flex: 1; min-width: 0; }
  .contact-name { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 400; color: var(--ink); letter-spacing: -0.2px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .contact-meta { display: flex; flex-direction: column; gap: 3px; }
  .contact-detail { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-2); cursor: pointer; border-radius: 5px; padding: 2px 4px; margin: -2px -4px; transition: background 0.15s, color 0.15s; width: fit-content; }
  .contact-detail:hover { background: rgba(61,107,79,0.07); color: var(--accent); }
  .contact-detail:hover svg { color: var(--accent); }
  .contact-detail svg { color: var(--ink-3); flex-shrink: 0; transition: color 0.15s; }
  .card-actions { position: absolute; top: 14px; right: 14px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .card-action-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; color: var(--ink-3); }
  .card-action-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .card-action-btn.danger:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-light); }
  .card-action-btn.loading { opacity: 0.4; pointer-events: none; }

  /* Edit card */
  .edit-card { background: var(--surface); border: 1px solid var(--accent); border-radius: var(--radius); padding: 18px 20px; box-shadow: 0 0 0 3px rgba(61,107,79,0.08); animation: fadeIn 0.2s ease both; }
  .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
  .edit-actions { display: flex; gap: 7px; justify-content: flex-end; }

  /* Empty */
  .empty { text-align: center; padding: 70px 20px; grid-column: 1 / -1; }
  .empty-icon { width: 64px; height: 64px; border-radius: 18px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .empty-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 400; color: var(--ink); margin-bottom: 7px; }
  .empty-sub { font-size: 13px; color: var(--ink-3); }

  /* Spinner */
  .spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--ink); color: white; font-size: 13px; font-weight: 500; padding: 10px 20px; border-radius: 30px; box-shadow: var(--shadow-lg); animation: toastIn 0.25s cubic-bezier(0.16,1,0.3,1); z-index: 999; white-space: nowrap; }
  .toast.error { background: var(--danger); }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* Mobile-only elements hidden on desktop */
  .mobile-topbar { display: none; }
  .mobile-search-bar { display: none; }
  .mobile-bottom-nav { display: none; }
  .mobile-fab { display: none; }

  /* ── Mobile ──────────────────────────────────────────────────────────────── */
  @media (max-width: 768px) {

    /* Kill desktop layout */
    .shell { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .topbar { display: none; }

    /* Main adjusts for mobile chrome */
    .main { padding-bottom: var(--mobile-nav-h); }

    /* ── Mobile topbar ── */
    .mobile-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      height: 56px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .mobile-topbar-left { display: flex; align-items: center; gap: 10px; }
    .mobile-logo-mark {
      width: 30px; height: 30px; background: var(--accent); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .mobile-logo-mark svg { color: white; }
    .mobile-logo-text { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; }
    .mobile-topbar-right { display: flex; align-items: center; gap: 8px; }
    .mobile-icon-btn {
      width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border);
      background: var(--bg); display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--ink-2); transition: all 0.15s;
    }
    .mobile-icon-btn:hover { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
    .mobile-user-dot {
      width: 30px; height: 30px; border-radius: 50%; background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 600; color: white; cursor: pointer;
    }

    /* ── Mobile search bar ── */
    .mobile-search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 56px;
      z-index: 40;
    }
    .mobile-search-inner {
      flex: 1; position: relative; display: flex; align-items: center;
    }
    .mobile-search-inner svg { position: absolute; left: 11px; color: var(--ink-3); pointer-events: none; }
    .mobile-search-input {
      width: 100%; background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 9px 12px 9px 34px;
      font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink);
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .mobile-search-input::placeholder { color: var(--ink-3); }
    .mobile-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(61,107,79,0.10); }

    /* ── Mobile content ── */
    .content { padding: 16px 16px 24px; }

    /* Stats: horizontal scroll strip */
    .stats-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 4px;
    }
    .stats-row::-webkit-scrollbar { display: none; }
    .stat-card {
      flex: 0 0 140px;
      padding: 14px 16px;
      border-radius: 12px;
    }
    .stat-value { font-size: 28px; }
    .stat-hint { font-size: 11px; }

    /* Add form: stacked, full-width */
    .add-form-wrap { padding: 18px 16px; margin-bottom: 16px; border-radius: 14px; }
    .form-heading { font-size: 16px; margin-bottom: 14px; }
    .form-grid { grid-template-columns: 1fr; gap: 10px; margin-bottom: 14px; }
    .form-actions { flex-direction: column-reverse; }
    .form-actions .btn-primary,
    .form-actions .btn-secondary { width: 100%; justify-content: center; padding: 13px; font-size: 14px; }

    /* Contacts grid: single column */
    .contacts-grid { grid-template-columns: 1fr; gap: 10px; }
    .contacts-header { margin-bottom: 10px; }

    /* Contact card: show actions always on mobile (no hover) */
    .card-actions { opacity: 1; top: 50%; right: 12px; transform: translateY(-50%); }
    .contact-card { padding: 14px 16px; min-height: 72px; border-radius: 14px; }
    .contact-name { font-size: 15px; }
    .contact-avatar { width: 38px; height: 38px; border-radius: 10px; font-size: 13px; }

    /* Edit card: stacked */
    .edit-card { padding: 16px; border-radius: 14px; }
    .edit-grid { grid-template-columns: 1fr; gap: 10px; }
    .edit-actions { flex-direction: column-reverse; }
    .edit-actions .btn-primary,
    .edit-actions .btn-secondary { width: 100%; justify-content: center; padding: 13px; font-size: 14px; }

    /* FAB — floating add button */
    .mobile-fab {
      display: flex;
      position: fixed;
      bottom: calc(var(--mobile-nav-h) + 16px);
      right: 16px;
      z-index: 60;
      width: 52px; height: 52px;
      background: var(--accent);
      border: none; border-radius: 16px;
      align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(61,107,79,0.40);
      transition: transform 0.15s, background 0.15s;
      color: white;
    }
    .mobile-fab:hover { background: var(--accent-hover); }
    .mobile-fab:active { transform: scale(0.93); }
    .mobile-fab.open { background: var(--ink); border-radius: 12px; }

    /* Toast sits above bottom nav */
    .toast { bottom: calc(var(--mobile-nav-h) + 16px); font-size: 12px; padding: 9px 16px; }

    /* ── Bottom nav ── */
    .mobile-bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: var(--mobile-nav-h);
      background: var(--surface);
      border-top: 1px solid var(--border);
      z-index: 50;
      padding: 0 8px;
      padding-bottom: env(safe-area-inset-bottom);
    }
    .mobile-nav-item {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; border: none; background: none; cursor: pointer;
      color: var(--ink-3); font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500;
      transition: color 0.15s; padding: 8px 0; border-radius: 10px;
    }
    .mobile-nav-item.active { color: var(--accent); }
    .mobile-nav-item svg { transition: transform 0.15s; }
    .mobile-nav-item.active svg { transform: scale(1.1); }
    .mobile-nav-badge {
      position: absolute; top: 6px; right: calc(50% - 18px);
      background: var(--accent); color: white;
      font-size: 9px; font-weight: 600;
      padding: 1px 5px; border-radius: 20px; min-width: 16px; text-align: center;
    }
    .mobile-nav-item-wrap { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  }
`

// ─── Custom hook: debounced value ─────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const StatCard = memo(function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  )
})

const ContactCard = memo(function ContactCard({
  contact, animationDelay, isDeleting, onEdit, onDelete, onCopy,
}: {
  contact: Contact
  animationDelay: number
  isDeleting: boolean
  onEdit: (c: Contact) => void
  onDelete: (id: string, name: string) => void
  onCopy: (text: string) => void
}) {
  return (
    <div className="contact-card" style={{ animationDelay: `${animationDelay}ms` }}>
      <div className="contact-avatar" style={{ background: getAvatarColor(contact.name) }}>
        {getInitials(contact.name)}
      </div>
      <div className="contact-info">
        <div className="contact-name">{contact.name}</div>
        <div className="contact-meta">
          {hasValue(contact.phone) && (
            <div className="contact-detail" title="Click to copy" onClick={() => onCopy(contact.phone)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.5 5.5l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {contact.phone}
            </div>
          )}
          {hasValue(contact.address) && (
            <div className="contact-detail" title="Click to copy" onClick={() => onCopy(contact.address)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {contact.address}
            </div>
          )}
          {!hasValue(contact.phone) && !hasValue(contact.address) && (
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              No details saved
            </span>
          )}
        </div>
      </div>
      <div className="card-actions">
        <button className="card-action-btn" title="Edit contact" onClick={() => onEdit(contact)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={`card-action-btn danger${isDeleting ? ' loading' : ''}`}
          title="Delete contact"
          onClick={() => onDelete(contact.id, contact.name)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
})

const EditCard = memo(function EditCard({
  form, saving, onChange, onSave, onCancel,
}: {
  form: { name: string; phone: string; address: string }
  saving: boolean
  onChange: (field: 'name' | 'phone' | 'address', value: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="edit-card">
      <div className="form-heading" style={{ fontSize: 16, marginBottom: 14 }}>
        <span>Edit Contact</span>
        <button className="btn-ghost" onClick={onCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="edit-grid">
        <div className="field-wrap" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Full Name *</label>
          <input className="field-input" value={form.name} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="field-wrap">
          <label className="field-label">Phone</label>
          <input className="field-input" value={form.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
        <div className="field-wrap">
          <label className="field-label">Address</label>
          <input className="field-input" value={form.address} onChange={e => onChange('address', e.target.value)} />
        </div>
      </div>
      <div className="edit-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={onSave} disabled={saving || !form.name.trim()}>
          {saving ? <span className="spinner" /> : <SaveIcon />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
})

// ─── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser]         = useState<any>(null)
  const [contacts, setContacts] = useState<Contact[]>([])

  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm]         = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving]     = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm]   = useState({ name: '', phone: '', address: '' })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const [searchRaw, setSearchRaw] = useState('')
  const search = useDebounce(searchRaw, 180)

  const [toast, setToast]  = useState<ToastState | null>(null)
  const toastTimer          = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Boot ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { location.href = '/'; return }
      setUser(data.user)
      const { data: rows, error } = await supabase
        .from('contacts').select('*').eq('user_id', data.user.id).order('created_at', { ascending: true })
      if (!error) setContacts(rows ?? [])
    }
    load()
  }, [])

  // ── Toast ─────────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────

  const withPhone   = useMemo(() => contacts.filter(c => hasValue(c.phone)),   [contacts])
  const withAddress = useMemo(() => contacts.filter(c => hasValue(c.address)), [contacts])

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(q))
    )
  }, [contacts, search])

  const countLabel = useMemo(() =>
    contacts.length === 0 ? 'No contacts yet'
      : `${contacts.length} ${contacts.length === 1 ? 'person' : 'people'} saved`,
    [contacts.length]
  )

  // ── Handlers ──────────────────────────────────────────────────────────────

  const saveContact = useCallback(async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() })
      .select().single()
    if (error) showToast('Failed to save contact', 'error')
    else if (data) { setContacts(prev => [...prev, data]); showToast(`${form.name} added!`) }
    setForm({ name: '', phone: '', address: '' })
    setIsAdding(false)
    setSaving(false)
  }, [form, user, showToast])

  const startEdit = useCallback((c: Contact) => {
    setEditingId(c.id)
    setEditForm({ name: c.name, phone: c.phone || '', address: c.address || '' })
  }, [])

  const handleEditChange = useCallback((field: 'name' | 'phone' | 'address', value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editForm.name.trim() || !editingId) return
    setSaving(true)
    const { error } = await supabase.from('contacts')
      .update({ name: editForm.name.trim(), phone: editForm.phone.trim(), address: editForm.address.trim() })
      .eq('id', editingId)
    if (error) showToast('Failed to update', 'error')
    else { setContacts(prev => prev.map(c => c.id === editingId ? { ...c, ...editForm } : c)); showToast('Contact updated!') }
    setEditingId(null)
    setSaving(false)
  }, [editForm, editingId, showToast])

  const cancelEdit = useCallback(() => setEditingId(null), [])

  const deleteContact = useCallback(async (id: string, name: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) showToast('Failed to delete', 'error')
    else { setContacts(prev => prev.filter(c => c.id !== id)); showToast(`${name} removed`) }
    setDeletingId(null)
  }, [showToast])

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    showToast('Copied!')
  }, [showToast])

  const signOut = useCallback(async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    location.href = '/'
  }, [])

  const handleAddClick = useCallback(() => {
    setIsAdding(prev => !prev)
    setEditingId(null)
  }, [])

  const cancelAdd = useCallback(() => {
    setIsAdding(false)
    setForm({ name: '', phone: '', address: '' })
  }, [])

  const handleFormChange = useCallback((field: 'name' | 'phone' | 'address', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{STYLES}</style>

      {/* ── MOBILE TOPBAR ── */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-left">
          <div className="mobile-logo-mark">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="mobile-logo-text">Rolodex</span>
        </div>
        <div className="mobile-topbar-right">
          <button className="mobile-icon-btn" title="Sign out" onClick={signOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
          {user && (
            <div className="mobile-user-dot" title={user.email}>
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE SEARCH BAR ── */}
      <div className="mobile-search-bar">
        <div className="mobile-search-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="mobile-search-input"
            placeholder="Search contacts…"
            value={searchRaw}
            onChange={e => setSearchRaw(e.target.value)}
          />
        </div>
        {searchRaw && (
          <button className="btn-ghost" onClick={() => setSearchRaw('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="shell">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="logo-text">Rolodex</span>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Menu</div>
            <button className="sidebar-nav-item active">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              All Contacts
              <span className="nav-badge">{contacts.length}</span>
            </button>
            <button className="sidebar-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.5 5.5l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              With Phone
              <span className="nav-badge">{withPhone.length}</span>
            </button>
            <button className="sidebar-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              With Address
              <span className="nav-badge">{withAddress.length}</span>
            </button>
          </div>
          <div className="sidebar-footer">
            {user && (
              <div className="user-chip">
                <div className="user-avatar">{user.email?.[0]?.toUpperCase() ?? 'U'}</div>
                <div className="user-info">
                  <div className="user-label">Signed in as</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
            )}
            <button className={`btn-signout${signingOut ? ' loading' : ''}`} onClick={signOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          {/* Desktop topbar */}
          <div className="topbar">
            <div>
              <h1 className="page-heading">My Contacts</h1>
              <p className="page-sub">{countLabel}</p>
            </div>
            <div className="topbar-actions">
              <div className="search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="search-input" placeholder="Search contacts…" value={searchRaw} onChange={e => setSearchRaw(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleAddClick}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Contact
              </button>
            </div>
          </div>

          <div className="content">
            {/* Mobile page title (inside content, not topbar) */}
            <div style={{ marginBottom: 16 }} className="mobile-page-title-wrap">
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.8px', lineHeight: 1 }}>
                My Contacts
              </h1>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{countLabel}</p>
            </div>

            {/* STATS */}
            <div className="stats-row">
              <StatCard label="Total Contacts" value={contacts.length} hint="in your address book" />
              <StatCard label="With Phone"     value={withPhone.length} hint="have a number saved" />
              <StatCard label="With Address"   value={withAddress.length} hint="have a location saved" />
            </div>

            {/* ADD FORM */}
            {isAdding && (
              <div className="add-form-wrap">
                <div className="form-heading">
                  <span>New Contact</span>
                  <button className="btn-ghost" onClick={cancelAdd}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="form-grid">
                  <div className="field-wrap">
                    <label className="field-label">Full Name *</label>
                    <input className="field-input" placeholder="Jane Smith" value={form.name} autoFocus
                      onChange={e => handleFormChange('name', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveContact()} />
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Phone</label>
                    <input className="field-input" placeholder="+1 555 000 0000" value={form.phone}
                      onChange={e => handleFormChange('phone', e.target.value)} />
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Address</label>
                    <input className="field-input" placeholder="123 Main St, City" value={form.address}
                      onChange={e => handleFormChange('address', e.target.value)} />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={cancelAdd}>Cancel</button>
                  <button className="btn-primary" onClick={saveContact} disabled={saving || !form.name.trim()}>
                    {saving ? <span className="spinner" /> : <SaveIcon />}
                    {saving ? 'Saving…' : 'Save Contact'}
                  </button>
                </div>
              </div>
            )}

            {/* CONTACTS HEADER */}
            <div className="contacts-header">
              <span className="contacts-title">
                {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : 'All People'}
              </span>
              {search && (
                <button className="btn-ghost" onClick={() => setSearchRaw('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* CONTACTS GRID */}
            <div className="contacts-grid">
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--ink-3)' }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="empty-title">{search ? 'No matches found' : 'No contacts yet'}</div>
                  <p className="empty-sub">{search ? 'Try a different search term' : 'Tap + to add your first contact'}</p>
                </div>
              ) : (
                filtered.map((c, i) =>
                  editingId === c.id ? (
                    <EditCard key={c.id} form={editForm} saving={saving}
                      onChange={handleEditChange} onSave={saveEdit} onCancel={cancelEdit} />
                  ) : (
                    <ContactCard key={c.id} contact={c} animationDelay={i * 35}
                      isDeleting={deletingId === c.id} onEdit={startEdit}
                      onDelete={deleteContact} onCopy={copyToClipboard} />
                  )
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── MOBILE FAB ── */}
      <button className={`mobile-fab${isAdding ? ' open' : ''}`} onClick={handleAddClick} title="Add contact">
        {isAdding
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        }
      </button>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        <button className="mobile-nav-item active">
          <div className="mobile-nav-item-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {contacts.length > 0 && <span className="mobile-nav-badge">{contacts.length}</span>}
          </div>
          Contacts
        </button>
        <button className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.5 5.5l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Phone
        </button>
        <button className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Address
        </button>
        <button className="mobile-nav-item" onClick={signOut}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </nav>

      {/* ── TOAST ── */}
      {toast && <div className={`toast${toast.type === 'error' ? ' error' : ''}`}>{toast.msg}</div>}
    </>
  )
}