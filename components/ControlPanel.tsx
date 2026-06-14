"use client";

import { useState } from "react";
import {
  Eye, EyeOff, Lock, Settings, Palette, Crown, Star, BookOpen,
  RotateCcw, Save, CheckCircle, BarChart2, Users, FileText, ThumbsUp, Trash2,
  Plus, GraduationCap, X,
} from "lucide-react";
import { articles, leaderboard } from "@/data/articles";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useSubmissions } from "@/context/SubmissionsContext";
import { useVotes } from "@/context/VoteContext";
import { usePublishedArticles } from "@/hooks/usePublishedArticles";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const ADMIN_PASSWORD = "1234567";

type PanelTab = "overview" | "theme" | "wom" | "choice" | "content" | "team";

function SaveBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg z-50"
      style={{ backgroundColor: "#14532d", color: "#ffffff" }}
    >
      <CheckCircle size={16} />
      <span style={{ fontSize: "0.875rem" }}>Changes saved</span>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: "#16a34a" }}>
        {icon}
        <span style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
      <p style={{ color: "#14532d", fontWeight: 700, fontSize: "1.75rem", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.25rem" }}>{sub}</p>}
    </div>
  );
}

export function ControlPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<PanelTab>("overview");
  const [saved, setSaved] = useState(false);

  const { config, updateConfig, resetConfig } = useSiteConfig();
  const { submissions } = useSubmissions();
  const { votes } = useVotes();
  const { allPublished } = usePublishedArticles();
  const { executives, editorialTeam, addMember, removeMember } = useTeamMembers();

  const [draft, setDraft] = useState({ ...config });
  const [newThemeOption, setNewThemeOption] = useState("");
  const [newEditorChoiceId, setNewEditorChoiceId] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "",
    period: "",
    section: "executives" as "executives" | "editorial",
    grade: "",
  });

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError(false);
      setDraft({ ...config });
    } else {
      setError(true);
    }
  }

  function handleSave() {
    updateConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (confirm("Reset all site settings to defaults? This cannot be undone.")) {
      resetConfig();
      setDraft({ ...config });
    }
  }

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20">
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#fef9c3", border: "2px solid #fbbf24" }}
          >
            <Lock size={24} style={{ color: "#d97706" }} />
          </div>
          <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.4rem", marginBottom: "0.4rem" }}>
            Control Panel
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.75rem", lineHeight: "1.6" }}>
            Administrator access only. Enter the admin password to continue.
          </p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Admin password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
                  fontSize: "0.875rem",
                  outline: "none",
                  color: "#111827",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>Incorrect password. Please try again.</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#14532d", fontWeight: 500 }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalVotes = articles.reduce((sum, a) => sum + (votes[a.id] ?? a.votes), 0);
  const pendingCount  = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;

  const tabConfig: { key: PanelTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview",         icon: <BarChart2 size={14} /> },
    { key: "theme",    label: "Theme",             icon: <Palette size={14} /> },
    { key: "wom",      label: "Writer of Month",   icon: <Crown size={14} /> },
    { key: "choice",   label: "Editor's Choice",   icon: <Star size={14} /> },
    { key: "team",     label: "Our Team",          icon: <Users size={14} /> },
    { key: "content",  label: "Content",           icon: <BookOpen size={14} /> },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    fontSize: "0.875rem",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    color: "#374151",
    fontSize: "0.8rem",
    fontWeight: 500,
    display: "block",
    marginBottom: "0.4rem",
  };

  return (
    <div className="max-w-5xl mx-auto px-5 pt-24 pb-16">
      <SaveBanner show={saved} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Settings size={22} style={{ color: "#d97706" }} />
            <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.75rem" }}>Control Panel</h1>
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Manage site content, themes, and settings.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border hover:bg-red-50 transition-colors"
          style={{ borderColor: "#fca5a5", color: "#991b1b" }}
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8 pb-5 border-b" style={{ borderColor: "#e5e7eb" }}>
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              backgroundColor: tab === t.key ? "#14532d" : "#f3f4f6",
              color: tab === t.key ? "#ffffff" : "#374151",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<FileText size={15} />} label="Published"   value={articles.length} sub="current issue" />
            <StatCard icon={<ThumbsUp size={15} />} label="Total Votes" value={totalVotes} sub="across all pieces" />
            <StatCard icon={<FileText size={15} />} label="Submissions" value={pendingCount} sub={`${approvedCount} approved`} />
            <StatCard icon={<Users size={15} />}    label="Writers"     value={leaderboard.length} sub="this issue" />
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <div className="px-5 py-3 border-b" style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}>
              <p style={{ color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>Top 5 by votes this issue</p>
            </div>
            <div className="divide-y bg-white">
              {[...articles]
                .sort((a, b) => (votes[b.id] ?? b.votes) - (votes[a.id] ?? a.votes))
                .slice(0, 5)
                .map((a, i) => (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", width: "1.2rem" }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "#14532d", fontSize: "0.85rem", fontWeight: 500 }} className="truncate">{a.title}</p>
                      <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{a.author}</p>
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                    >
                      {a.category}
                    </span>
                    <span style={{ color: "#14532d", fontWeight: 600, fontSize: "0.875rem", minWidth: "2.5rem", textAlign: "right" }}>
                      {votes[a.id] ?? a.votes}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border p-5" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
              <p style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                Active Theme
              </p>
              <p style={{ color: "#14532d", fontWeight: 700, fontSize: "1.2rem" }}>{config.themeName}</p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>{config.themeMonth}</p>
            </div>
            <div className="rounded-xl border p-5" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
              <p style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                Writer of the Month
              </p>
              <p style={{ color: "#14532d", fontWeight: 700, fontSize: "1.2rem" }}>{config.womName}</p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>{config.womGrade}</p>
            </div>
          </div>
        </div>
      )}

      {/* Theme */}
      {tab === "theme" && (
        <div className="max-w-xl flex flex-col gap-5">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: "#fefce8", borderColor: "#fde68a" }}>
            <p style={{ color: "#92400e", fontSize: "0.8rem" }}>
              Changes here update the theme banner on the Homepage and the Help Desk form.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Theme Name</label>
            <input
              style={inputStyle}
              value={draft.themeName}
              onChange={(e) => setDraft((d) => ({ ...d, themeName: e.target.value }))}
              placeholder="e.g. Courage"
            />
          </div>

          <div>
            <label style={labelStyle}>Month Label</label>
            <input
              style={inputStyle}
              value={draft.themeMonth}
              onChange={(e) => setDraft((d) => ({ ...d, themeMonth: e.target.value }))}
              placeholder="e.g. June 2026"
            />
          </div>

          <div>
            <label style={labelStyle}>Theme Description</label>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
              value={draft.themeDescription}
              onChange={(e) => setDraft((d) => ({ ...d, themeDescription: e.target.value }))}
              placeholder="Describe this month's theme..."
            />
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}>
            <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.5rem" }}>Preview</p>
            <p style={{ color: "#92400e", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{draft.themeMonth} Theme</p>
            <p style={{ color: "#78350f", fontWeight: 700, fontSize: "1.2rem" }}>{draft.themeName || "—"}</p>
            <p style={{ color: "#92400e", fontSize: "0.8rem", lineHeight: "1.5", marginTop: "0.25rem" }}>{draft.themeDescription || "—"}</p>
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
            <label style={labelStyle}>Theme Options (shown in the Help Desk submission form)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(config.themeOptions ?? []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.themeOptions ?? []).filter((x) => x !== t);
                      updateConfig({ themeOptions: updated });
                    }}
                    style={{ color: "#16a34a", display: "flex" }}
                    title={`Remove "${t}"`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(config.themeOptions ?? []).length === 0 && (
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No theme options yet.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                style={inputStyle}
                value={newThemeOption}
                onChange={(e) => setNewThemeOption(e.target.value)}
                placeholder="e.g. Resilience"
              />
              <button
                type="button"
                onClick={() => {
                  const value = newThemeOption.trim();
                  if (!value) return;
                  if ((config.themeOptions ?? []).includes(value)) {
                    setNewThemeOption("");
                    return;
                  }
                  updateConfig({ themeOptions: [...(config.themeOptions ?? []), value] });
                  setNewThemeOption("");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity shrink-0"
                style={{ backgroundColor: "#14532d" }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="self-start flex items-center gap-2 px-6 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#14532d" }}
          >
            <Save size={15} /> Save Theme
          </button>
        </div>
      )}

      {/* Writer of the Month */}
      {tab === "wom" && (
        <div className="max-w-xl flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Select Writer</label>
            <input
              style={inputStyle}
              value={draft.womName}
              onChange={(e) => setDraft((d) => ({ ...d, womName: e.target.value }))}
              placeholder="Writer's name"
            />
          </div>

          <div>
            <label style={labelStyle}>Grade</label>
            <input
              style={inputStyle}
              value={draft.womGrade}
              onChange={(e) => setDraft((d) => ({ ...d, womGrade: e.target.value }))}
              placeholder="e.g. Grade 11 — AS-B"
            />
          </div>

          <div>
            <label style={labelStyle}>Featured Writing</label>
            <select
              style={{ ...inputStyle, color: "#111827" }}
              value={draft.womArticleId}
              onChange={(e) => setDraft((d) => ({ ...d, womArticleId: e.target.value }))}
            >
              {(() => {
                const byAuthor = allPublished.filter((a) => a.author === draft.womName);
                const list = byAuthor.length > 0 ? byAuthor : allPublished;
                return list.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}{byAuthor.length === 0 ? ` — ${a.author}` : ""}</option>
                ));
              })()}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
              value={draft.womBio}
              onChange={(e) => setDraft((d) => ({ ...d, womBio: e.target.value }))}
              placeholder="Short bio shown on the homepage..."
            />
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: "#14532d" }}>
            <p style={{ color: "#86efac", fontSize: "0.7rem", marginBottom: "0.25rem" }}>Preview — Homepage Banner</p>
            <p style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>{draft.womName || "—"}</p>
            <p style={{ color: "#86efac", fontSize: "0.8rem" }}>{draft.womGrade}</p>
            <p style={{ color: "#bbf7d0", fontSize: "0.8rem", marginTop: "0.4rem", lineHeight: "1.5" }}>{draft.womBio || "—"}</p>
          </div>

          <button
            onClick={handleSave}
            className="self-start flex items-center gap-2 px-6 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#14532d" }}
          >
            <Save size={15} /> Save
          </button>
        </div>
      )}

      {/* Editor's Choice */}
      {tab === "choice" && (
        <div className="max-w-xl flex flex-col gap-5">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: "#fefce8", borderColor: "#fde68a" }}>
            <p style={{ color: "#92400e", fontSize: "0.8rem" }}>
              All pieces added here will appear as Editor&apos;s Choice on the homepage — no limit on how many.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Add Featured Writing (Editor&apos;s Choice)</label>
            <div className="flex gap-2">
              <select
                style={{ ...inputStyle, color: "#111827" }}
                value={newEditorChoiceId}
                onChange={(e) => setNewEditorChoiceId(e.target.value)}
              >
                <option value="">Select a piece…</option>
                {allPublished
                  .filter((a) => !(config.editorChoiceIds ?? []).includes(a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.title} — {a.author}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!newEditorChoiceId) return;
                  const updated = [...(config.editorChoiceIds ?? []), newEditorChoiceId];
                  updateConfig({ editorChoiceIds: updated });
                  setDraft((d) => ({ ...d, editorChoiceIds: updated }));
                  setNewEditorChoiceId("");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity shrink-0"
                style={{ backgroundColor: "#14532d" }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {(config.editorChoiceIds ?? []).length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No pieces selected yet.</p>
            )}
            {(config.editorChoiceIds ?? []).map((id) => {
              const selected = allPublished.find((a) => a.id === id);
              if (!selected) return null;
              return (
                <div key={id} className="rounded-xl border overflow-hidden" style={{ borderColor: "#bbf7d0" }}>
                  <div className="px-5 py-2 flex items-center justify-between gap-2" style={{ backgroundColor: "#dcfce7" }}>
                    <div className="flex items-center gap-2">
                      <Star size={13} style={{ color: "#15803d" }} fill="#15803d" />
                      <span style={{ color: "#15803d", fontSize: "0.75rem", fontWeight: 500 }}>Editor&apos;s Choice</span>
                    </div>
                    <button
                      onClick={() => {
                        const updated = (config.editorChoiceIds ?? []).filter((x) => x !== id);
                        updateConfig({ editorChoiceIds: updated });
                        setDraft((d) => ({ ...d, editorChoiceIds: updated }));
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                  <div className="p-5 bg-white">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs mb-2"
                      style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                    >
                      {selected.category}
                    </span>
                    <p style={{ color: "#14532d", fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>{selected.title}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.8rem", lineHeight: "1.6" }}>{selected.excerpt}</p>
                    <p style={{ color: "#14532d", fontSize: "0.8rem", fontWeight: 500, marginTop: "0.75rem" }}>{selected.author}</p>
                    <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{selected.grade}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Our Team */}
      {tab === "team" && (
        <div className="max-w-3xl flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              Manage who appears in Our Team — Executives and the Editorial Team.
            </p>
            <button
              onClick={() => setShowAddMember((s) => !s)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity shrink-0"
              style={{ backgroundColor: "#14532d" }}
            >
              <Plus size={14} /> Add New Member
            </button>
          </div>

          {showAddMember && (
            <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    style={inputStyle}
                    value={memberForm.name}
                    onChange={(e) => setMemberForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Ms. Nadia Karim"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <input
                    style={inputStyle}
                    value={memberForm.role}
                    onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Faculty Advisor / Editor-in-Chief"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Section</label>
                  <select
                    style={{ ...inputStyle, color: "#111827" }}
                    value={memberForm.section}
                    onChange={(e) => setMemberForm((f) => ({ ...f, section: e.target.value as "executives" | "editorial" }))}
                  >
                    <option value="executives">Executives</option>
                    <option value="editorial">Editorial Team</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Period</label>
                  <input
                    style={inputStyle}
                    value={memberForm.period}
                    onChange={(e) => setMemberForm((f) => ({ ...f, period: e.target.value }))}
                    placeholder="e.g. 2025–Present"
                  />
                </div>
              </div>

              {memberForm.section === "editorial" && (
                <div>
                  <label style={labelStyle}>Grade</label>
                  <input
                    style={inputStyle}
                    value={memberForm.grade}
                    onChange={(e) => setMemberForm((f) => ({ ...f, grade: e.target.value }))}
                    placeholder="e.g. Grade 11"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!memberForm.name.trim() || !memberForm.role.trim() || !memberForm.period.trim()) return;
                    addMember({
                      name: memberForm.name.trim(),
                      role: memberForm.role.trim(),
                      period: memberForm.period.trim(),
                      type: memberForm.section === "executives" ? "teacher" : "student",
                      grade: memberForm.section === "editorial" ? memberForm.grade.trim() || undefined : undefined,
                    });
                    setMemberForm({ name: "", role: "", period: "", section: "executives", grade: "" });
                    setShowAddMember(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#14532d" }}
                >
                  <Save size={14} /> Save Member
                </button>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="px-5 py-2 rounded-xl text-sm border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#e5e7eb", color: "#374151" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap size={16} style={{ color: "#16a34a" }} />
              <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1rem" }}>Executives</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
            </div>
            <div className="flex flex-col gap-3">
              {executives.map((m) => (
                <div
                  key={m.id ?? m.name + m.period}
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: "#14532d" }}
                  >
                    <GraduationCap size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</p>
                    <p style={{ color: "#16a34a", fontSize: "0.8rem" }}>{m.role}</p>
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{m.period}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.name} from Our Team? This cannot be undone.`)) removeMember(m);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity shrink-0"
                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
              {executives.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No executives added yet.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users size={16} style={{ color: "#16a34a" }} />
              <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1rem" }}>Editorial Team</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
            </div>
            <div className="flex flex-col gap-3">
              {editorialTeam.map((m) => (
                <div
                  key={m.id ?? m.name + m.period}
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: "#6b7280" }}
                  >
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</p>
                    <p style={{ color: "#16a34a", fontSize: "0.8rem" }}>{m.role}</p>
                    {m.grade && <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>{m.grade}</p>}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{m.period}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.name} from Our Team? This cannot be undone.`)) removeMember(m);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity shrink-0"
                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
              {editorialTeam.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No editorial team members added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === "content" && (
        <div className="flex flex-col gap-3">
          <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
            {allPublished.filter((a) => !(config.removedArticleIds ?? []).includes(a.id)).length} pieces published across the site
          </p>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <div
              className="grid grid-cols-[1fr_auto_auto_auto_auto] px-5 py-2.5 border-b"
              style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
            >
              {["Title / Author", "Category", "Votes", "Flags", "Actions"].map((h) => (
                <span key={h} style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500 }}>{h}</span>
              ))}
            </div>
            <div className="divide-y bg-white">
              {allPublished
                .filter((a) => !(config.removedArticleIds ?? []).includes(a.id))
                .map((a) => (
                <div key={a.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-3.5 gap-4">
                  <div className="min-w-0">
                    <p style={{ color: "#14532d", fontSize: "0.85rem", fontWeight: 500 }} className="truncate">{a.title}</p>
                    <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{a.author} · {a.grade.split("—")[0].trim()}</p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap"
                    style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                  >
                    {a.category}
                  </span>
                  <span style={{ color: "#14532d", fontWeight: 600, fontSize: "0.875rem", minWidth: "2.5rem", textAlign: "right" }}>
                    {votes[a.id] ?? a.votes}
                  </span>
                  <div className="flex gap-1.5 justify-end">
                    {(a.isEditorChoice || (config.editorChoiceIds ?? []).includes(a.id)) ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: "#dcfce7", color: "#14532d", border: "1px solid #bbf7d0" }}
                      >
                        <Star size={10} fill="#15803d" style={{ color: "#15803d" }} /> EC
                      </span>
                    ) : null}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Permanently remove "${a.title}" from the site? This cannot be undone.`)) {
                          const updated = [...(config.removedArticleIds ?? []), a.id];
                          updateConfig({ removedArticleIds: updated });
                          setDraft((d) => ({ ...d, removedArticleIds: updated }));
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
