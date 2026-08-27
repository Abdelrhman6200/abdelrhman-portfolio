import {
  Award,
  ClipboardCheck,
  ListFilter,
  Medal,
  RotateCcw,
  Search,
  Trophy,
  UsersRound,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  bestAvailableGrade,
  collectivePercent,
  collectiveTotal,
  comparisonCohortPercent,
  comparisonCohortTotal,
  replaceSubgroupAssessment,
  subgroupRank,
} from "@/lib/collectiveGrading";
import {
  certificateCategories,
  defaultRubricScores,
  prototypeCertification,
  rubricMaximum,
  rubricSections,
  type RubricScore,
  type RubricScores,
} from "@/lib/rubric";
import {
  assessmentsForGroup,
  initialNumberedAssessments,
  numberedGroups,
} from "@/lib/numberedGroupDemo";

export default function CollectiveGradingDemo() {
  const [selectedGroupId, setSelectedGroupId] = useState("group-1");
  const [selectedSubgroupId, setSelectedSubgroupId] = useState("group-1-a");
  const [assessments, setAssessments] = useState(initialNumberedAssessments);
  const [scores, setScores] = useState<RubricScores>(
    initialNumberedAssessments[0]!.scores
  );
  const [notice, setNotice] = useState(
    "Choose a subgroup, rate all 15 rubric criteria, then submit. The system calculates every outcome."
  );
  const [groupSearch, setGroupSearch] = useState("");
  const [criterionSearch, setCriterionSearch] = useState("");

  const group =
    numberedGroups.find(item => item.id === selectedGroupId) ??
    numberedGroups[0]!;
  const subgroup =
    group.subgroups.find(item => item.id === selectedSubgroupId) ??
    group.subgroups[0]!;
  const cohortAssessments = assessmentsForGroup(group, assessments);
  const subgroupAssessment = cohortAssessments.find(
    item => item.subgroupId === subgroup.id
  ) ?? { subgroupId: subgroup.id, scores: defaultRubricScores };
  const cohortTotal = comparisonCohortTotal(cohortAssessments);
  const cohortPercent = comparisonCohortPercent(cohortAssessments);
  const subgroupTotal = collectiveTotal(subgroupAssessment.scores);
  const subgroupPercent = collectivePercent(subgroupAssessment.scores);
  const rank = subgroupRank(cohortAssessments, subgroup.id);
  const outcome = bestAvailableGrade(subgroupPercent, cohortPercent, rank);
  const formTotal = collectiveTotal(scores);
  const formCertification = prototypeCertification(formTotal);
  const availableGroups = useMemo(
    () =>
      numberedGroups.filter(item =>
        `Group ${item.number}`
          .toLowerCase()
          .includes(groupSearch.trim().toLowerCase())
      ),
    [groupSearch]
  );
  const filteredSections = useMemo(
    () =>
      rubricSections
        .map((section, sectionIndex) => ({
          ...section,
          sectionIndex,
          items: section.items
            .map((criterion, itemIndex) => ({ criterion, itemIndex }))
            .filter(item =>
              item.criterion
                .toLowerCase()
                .includes(criterionSearch.trim().toLowerCase())
            ),
        }))
        .filter(section => section.items.length > 0),
    [criterionSearch]
  );
  const sorted = useMemo(
    () =>
      group.subgroups
        .map(item => {
          const assessment = cohortAssessments.find(
            record => record.subgroupId === item.id
          ) ?? { subgroupId: item.id, scores: defaultRubricScores };
          return {
            subgroup: item,
            total: collectiveTotal(assessment.scores),
            percent: collectivePercent(assessment.scores),
          };
        })
        .sort((a, b) => b.total - a.total),
    [group, cohortAssessments]
  );

  useEffect(
    () => setScores([...subgroupAssessment.scores]),
    [group.id, subgroup.id]
  );

  const chooseGroup = (id: string) => {
    const next =
      numberedGroups.find(item => item.id === id) ?? numberedGroups[0]!;
    setSelectedGroupId(next.id);
    setSelectedSubgroupId(next.subgroups[0]!.id);
  };
  const updateScore = (index: number, value: RubricScore) =>
    setScores(
      current =>
        current.map((score, scoreIndex) =>
          scoreIndex === index ? value : score
        ) as RubricScores
    );
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setAssessments(current =>
      replaceSubgroupAssessment(current, { subgroupId: subgroup.id, scores })
    );
    setNotice(
      `${subgroup.name} was assessed across all 15 criteria. The system recalculated its certificate title, rank, and strongest available grade against the Group ${group.number} comparison cohort.`
    );
  };
  const reset = () => {
    setAssessments(initialNumberedAssessments);
    setScores([...initialNumberedAssessments[0]!.scores]);
    setSelectedGroupId("group-1");
    setSelectedSubgroupId("group-1-a");
    setGroupSearch("");
    setCriterionSearch("");
    setNotice("Example subgroup assessments restored.");
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#26363c]">
      <header className="border-b border-[#e8e4dd] bg-[#fbfaf7]">
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1d6d66] text-white">
              <ClipboardCheck size={19} />
            </span>
            <span>
              <span className="block font-display text-[21px] leading-none">
                Lumen
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.16em] text-[#74817d]">
                Collective grading demo
              </span>
            </span>
          </Link>
          <Link
            href="/grading-admin"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e1ded7] bg-white px-3 py-2 text-xs font-bold text-[#55645f]"
          >
            <ListFilter size={14} />
            Administrator comparison
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1380px] px-5 py-7 md:px-8">
        <div className="mb-6">
          <p className="section-label">Teacher subgroup grading</p>
          <h1 className="mt-2 font-display text-[35px] tracking-[-.03em]">
            Assess subgroups. Compare them fairly.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#72807c]">
            Search a numbered group or a rubric criterion, then assess a single
            subgroup. Groups organise comparison cohorts only; they do not
            receive an independent score or certificate.
          </p>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ecdcbf] bg-[#fff9ef] px-4 py-3 text-xs leading-relaxed text-[#806941]">
          <span>
            <strong>Demo data only.</strong> Certificate titles and
            strongest-grade rules remain prototype settings until approved.
          </span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-bold"
          >
            <RotateCcw size={13} />
            Reset demo
          </button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)_320px]">
          <aside className="surface h-fit overflow-hidden">
            <div className="border-b border-[#ece8e1] p-5">
              <p className="section-label">Choose subgroup</p>
              <p className="mt-1 text-sm font-bold">
                Select an assessment target
              </p>
            </div>
            <div className="space-y-4 p-3">
              <label>
                <span className="section-label">Search group number</span>
                <span className="relative mt-1.5 block">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71807d]"
                  />
                  <input
                    aria-label="Search group number"
                    value={groupSearch}
                    onChange={event =>
                      setGroupSearch(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    placeholder="1–1000"
                    className="h-10 w-full rounded-xl border border-[#e1ded7] bg-[#fcfbf9] pl-9 pr-3 text-xs font-bold"
                  />
                </span>
              </label>
              <label>
                <span className="section-label">Comparison group</span>
                <select
                  value={group.id}
                  onChange={event => chooseGroup(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#e1ded7] bg-[#fcfbf9] px-3 text-xs font-bold"
                >
                  {availableGroups.length ? (
                    availableGroups.map(item => (
                      <option key={item.id} value={item.id}>
                        Group {item.number}
                      </option>
                    ))
                  ) : (
                    <option value={group.id}>No matching group</option>
                  )}
                </select>
                <span className="mt-1 block text-[10px] text-[#78827e]">
                  {availableGroups.length} matching group
                  {availableGroups.length === 1 ? "" : "s"}.
                </span>
              </label>
              <label>
                <span className="section-label">Subgroup to assess</span>
                <select
                  value={subgroup.id}
                  onChange={event => setSelectedSubgroupId(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#e1ded7] bg-[#fcfbf9] px-3 text-xs font-bold"
                >
                  {group.subgroups.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-xl bg-[#f5faf7] p-3 text-[11px] leading-relaxed text-[#607b73]">
                <UsersRound size={14} className="mb-2 text-[#176f69]" />
                Group {group.number} is a comparison cohort only. This form
                assesses {subgroup.name}.
              </div>
            </div>
          </aside>
          <section className="surface overflow-hidden">
            <div className="border-b border-[#ece8e1] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-label">Subgroup full-rubric form</p>
                  <h2 className="mt-1 text-[22px] font-bold">
                    {subgroup.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#71807d]">
                    Group {group.number} · Score each criterion as 1, 3, or 5.
                  </p>
                </div>
                <div
                  className={`rounded-xl px-3 py-2 ${formCertification.tone}`}
                >
                  <p className="section-label !text-current opacity-75">
                    Certificate title · {formCertification.category}
                  </p>
                  <p className="mt-1 text-xs font-bold">
                    {formCertification.label}
                  </p>
                  <p className="mt-1 font-display text-[26px]">
                    {formTotal}
                    <span className="text-sm"> / {rubricMaximum}</span>
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={submit} className="p-5">
              <div className="mb-5 rounded-xl border border-[#d7e9e3] bg-[#f4fbf8] px-3 py-3 text-xs leading-relaxed text-[#52746c]">
                {notice}
              </div>
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <Metric
                  icon={<ClipboardCheck size={16} />}
                  label="Rubric criteria"
                  value="15"
                />
                <Metric
                  icon={<Medal size={16} />}
                  label="Rating scale"
                  value="1 · 3 · 5"
                />
                <Metric
                  icon={<Award size={16} />}
                  label="Calculation"
                  value="Title + grade"
                />
              </div>
              <label className="mb-5 block">
                <span className="section-label">Search rubric criteria</span>
                <span className="relative mt-1.5 block">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71807d]"
                  />
                  <input
                    aria-label="Search rubric criteria"
                    value={criterionSearch}
                    onChange={event => setCriterionSearch(event.target.value)}
                    placeholder="For example: market, team, presentation"
                    className="h-10 w-full rounded-xl border border-[#e1ded7] bg-[#fcfbf9] pl-9 pr-3 text-sm"
                  />
                </span>
              </label>
              {filteredSections.length ? (
                filteredSections.map(section => (
                  <section
                    key={section.section}
                    className="mb-5 overflow-hidden rounded-xl border border-[#e7e3dc]"
                  >
                    <div className="bg-[#faf9f7] px-4 py-3">
                      <p className="text-sm font-bold">{section.section}</p>
                      <p className="mt-1 text-[11px] text-[#7c8581]">
                        {section.items.length} matching criterion
                        {section.items.length === 1 ? "" : " criteria"}
                      </p>
                    </div>
                    <div className="divide-y divide-[#eeeae4]">
                      {section.items.map(({ criterion, itemIndex }) => {
                        const index = section.sectionIndex * 3 + itemIndex;
                        const score = scores[index] ?? 3;
                        return (
                          <div
                            key={criterion}
                            className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_190px]"
                          >
                            <div>
                              <p className="text-xs font-bold">{criterion}</p>
                              <p className="mt-1 text-[11px] text-[#78827e]">
                                {score === 1
                                  ? "Needs improvement"
                                  : score === 3
                                    ? "Good"
                                    : "Excellent"}{" "}
                                — select the descriptor-supported rating.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 md:justify-end">
                              {([1, 3, 5] as RubricScore[]).map(value => (
                                <button
                                  type="button"
                                  key={value}
                                  aria-label={`${criterion}: ${value}`}
                                  onClick={() => updateScore(index, value)}
                                  className={`h-9 min-w-10 rounded-lg text-xs font-bold ${score === value ? "bg-[#1d6d66] text-white" : "bg-[#f3f1ed] text-[#6d7975]"}`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#ddd7cd] bg-[#fcfbf9] p-6 text-center text-sm text-[#75817d]">
                  No rubric criterion matches “{criterionSearch}”. Clear or
                  revise your search.
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#f5f8f6] p-4">
                <div>
                  <p className="section-label">Calculated subgroup score</p>
                  <p className="mt-1 font-display text-[31px] text-[#176f69]">
                    {formTotal}
                    <span className="text-sm"> / {rubricMaximum}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#74807c]">
                    No grade or certificate is entered by the instructor.
                  </p>
                </div>
                <button className="app-button-primary">
                  <ClipboardCheck size={15} />
                  Collect & calculate
                </button>
              </div>
            </form>
          </section>
          <aside className="space-y-5">
            <section className="surface p-5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-[#b6842c]" />
                <p className="section-label">Strongest available grade</p>
              </div>
              <p className="mt-3 font-display text-[56px] leading-none text-[#176f69]">
                {outcome.grade}
              </p>
              <p className="mt-2 text-sm font-bold">{outcome.label}</p>
              <div className="mt-4 space-y-2 text-xs">
                <Row
                  label="Subgroup rubric total"
                  value={`${subgroupTotal} / ${rubricMaximum}`}
                />
                <Row
                  label="Certificate title"
                  value={prototypeCertification(subgroupTotal).title.replace(
                    "Level 1 Certificate · ",
                    ""
                  )}
                />
                <Row
                  label="Certificate category"
                  value={prototypeCertification(subgroupTotal).category}
                />
                <Row label="Subgroup score" value={`${subgroupPercent}%`} />
                <Row
                  label="Comparison cohort"
                  value={`${cohortTotal} / ${rubricMaximum} · ${cohortPercent}%`}
                />
                <Row
                  label="Rank in cohort"
                  value={`#${rank} of ${group.subgroups.length}`}
                />
              </div>
              <p className="mt-4 rounded-xl bg-[#fff8ed] p-3 text-[10px] leading-relaxed text-[#836c47]">
                Only the subgroup is graded. Group {group.number} supplies its
                comparison cohort for rank and collective-evidence calculations.
              </p>
            </section>
            <section className="surface overflow-hidden">
              <div className="border-b border-[#ece8e1] p-4">
                <p className="section-label">Certificate title categories</p>
                <p className="mt-1 text-sm font-bold">
                  Best available title is clear
                </p>
              </div>
              <div className="divide-y divide-[#efebe4]">
                {certificateCategories.map(category => (
                  <div key={category.title} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold ${category.tone}`}
                      >
                        {category.category}
                      </span>
                      <span className="text-[10px] font-bold text-[#586762]">
                        {category.minimumScore}–
                        {category.category === "best available"
                          ? rubricMaximum
                          : category.category === "achieved"
                            ? 64
                            : 49}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold">
                      {category.title.replace("Level 1 Certificate · ", "")}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-[#74807c]">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section className="surface overflow-hidden">
              <div className="border-b border-[#ece8e1] p-4">
                <p className="section-label">
                  Subgroup ranking in Group {group.number}
                </p>
              </div>
              <div className="divide-y divide-[#efebe4]">
                {sorted.map((item, index) => (
                  <div
                    key={item.subgroup.id}
                    className="flex items-center gap-3 p-3"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3f1ed] text-xs font-bold">
                      #{index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">
                        {item.subgroup.name}
                      </span>
                      <span className="text-[10px] text-[#79837f]">
                        {item.total} / {rubricMaximum} · Group {group.number}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-[#176f69]">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eeeae4] pb-2">
      <span className="text-[#78827e]">{label}</span>
      <span className="text-right font-bold capitalize text-[#40534f]">
        {value}
      </span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e1ebe6] bg-white p-3">
      <div className="flex items-center gap-2 text-[#176f69]">
        {icon}
        <p className="section-label !text-current">{label}</p>
      </div>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
