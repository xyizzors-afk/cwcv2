"use client";

import { useMemo } from "react";
import { pastStaff, type StaffMember } from "@/data/articles";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function teamMemberKey(m: StaffMember) {
  return m.id ?? `${m.name}|${m.period}|${m.role}`;
}

/**
 * Returns the merged list of team members (built-in + admin-added, minus
 * admin-removed) split into executives (teacher) and editorial team
 * (student), plus helpers for the Control Panel to add/remove members.
 */
export function useTeamMembers() {
  const { config, updateConfig } = useSiteConfig();
  const removed = new Set(config.removedTeamMemberIds ?? []);

  const all = useMemo(() => {
    const builtIn = pastStaff.filter((m) => !removed.has(teamMemberKey(m)));
    const extra = (config.teamMembers ?? []).filter((m) => !removed.has(teamMemberKey(m)));
    return [...builtIn, ...extra];
  }, [config.teamMembers, config.removedTeamMemberIds]);

  const executives = all.filter((m) => m.type === "teacher");
  const editorialTeam = all.filter((m) => m.type === "student");

  function addMember(member: Omit<StaffMember, "id">) {
    const newMember: StaffMember = { ...member, id: `team-${Date.now()}` };
    updateConfig({ teamMembers: [...(config.teamMembers ?? []), newMember] });
  }

  function removeMember(member: StaffMember) {
    const key = teamMemberKey(member);
    // If it's an admin-added member, drop it from teamMembers entirely.
    const stillInExtra = (config.teamMembers ?? []).filter((m) => teamMemberKey(m) !== key);
    updateConfig({
      teamMembers: stillInExtra,
      removedTeamMemberIds: [...new Set([...(config.removedTeamMemberIds ?? []), key])],
    });
  }

  return { all, executives, editorialTeam, addMember, removeMember };
}
