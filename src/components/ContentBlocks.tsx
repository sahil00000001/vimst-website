import { visibleBlocks, type Block, type Cell } from '@/lib/content';
import { Expandable } from './Expandable';
import { Reveal, Stagger, StaggerItem } from './Motion';

/* ------------------------------------------------------------------
   Curriculum tables

   Almost every table in the source is the same thing: two semesters side
   by side, a "Subject to be taught" spanning row, then paired subject
   cells. Rendering that as a raw <table> reads badly on a phone, so it is
   reshaped into paired subject lists that stack cleanly.
   ------------------------------------------------------------------ */

type Curriculum = {
  columns: string[];
  rows: string[][];
};

function asCurriculum(rows: Cell[][]): Curriculum | null {
  if (rows.length < 2) return null;

  let columns: string[] = [];
  let body = rows;

  const first = rows[0];
  if (first.length === 2 && first.every((c) => /semester|year|part|term/i.test(c.text))) {
    columns = first.map((c) => c.text);
    body = rows.slice(1);
  }

  // Drop the "Subject to be taught" spanning label -- it says nothing the
  // surrounding layout does not already say.
  body = body.filter(
    (r) => !(r.length === 1 && /subject to be taught/i.test(r[0].text))
  );

  if (body.length === 0) return null;
  if (!body.every((r) => r.length <= 2)) return null;

  const cells = body.map((r) => r.map((c) => c.text));
  if (columns.length === 0 && cells.every((r) => r.length < 2)) return null;

  return { columns, rows: cells };
}

function CurriculumTable({ caption, rows }: { caption: string | null; rows: Cell[][] }) {
  const data = asCurriculum(rows);

  if (!data) return <GenericTable caption={caption} rows={rows} />;

  const left = data.rows.map((r) => r[0]).filter(Boolean);
  const right = data.rows.map((r) => r[1]).filter(Boolean);
  const columns =
    data.columns.length === 2 ? data.columns : right.length ? ['Group A', 'Group B'] : [];
  const groups = right.length ? [left, right] : [left];

  return (
    <Reveal from="up" className="overflow-hidden rounded-xl border border-rule bg-paper">
      {caption && (
        <div className="border-b border-rule bg-linen px-6 py-3.5">
          <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[0.14em] text-brand">
            {caption}
          </h3>
        </div>
      )}
      <div className="grid gap-px bg-rule sm:grid-cols-2">
        {groups.map((subjects, gi) => (
          <div key={gi} className="bg-paper p-6">
            {columns[gi] && (
              <p className="mb-4 flex items-center gap-2.5 font-display text-[length:var(--text-base)] text-ink">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-[length:var(--text-2xs)] font-semibold text-brand">
                  {gi + 1}
                </span>
                {columns[gi]}
              </p>
            )}
            <Stagger as="ul" className="space-y-0" gap={0.03}>
              {subjects.map((s, i) => (
                <StaggerItem
                  as="li"
                  key={`${s}-${i}`}
                  className="group flex items-baseline gap-3 border-b border-rule-soft py-2.5 last:border-0"
                >
                  <span className="w-5 shrink-0 text-[length:var(--text-2xs)] tabular-nums text-mist">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[length:var(--text-base)] leading-snug text-graphite transition-colors group-hover:text-ink">
                    {s}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))}
        {groups.length === 1 && <div className="hidden bg-shell sm:block" />}
      </div>
    </Reveal>
  );
}

/* Fallback for anything that is not a two-column curriculum grid. */
function GenericTable({ caption, rows }: { caption: string | null; rows: Cell[][] }) {
  const [head, ...body] = rows;
  const headerRow = head?.every((c) => c.header) ? head : null;
  const bodyRows = headerRow ? body : rows;

  return (
    <Reveal from="up" className="overflow-hidden rounded-xl border border-rule bg-paper">
      {caption && (
        <div className="border-b border-rule bg-linen px-6 py-3.5">
          <h3 className="text-[length:var(--text-sm)] font-semibold uppercase tracking-[0.14em] text-brand">
            {caption}
          </h3>
        </div>
      )}
      <div className="mg-scroll overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          {headerRow && (
            <thead>
              <tr className="bg-linen">
                {headerRow.map((c, i) => (
                  <th
                    key={i}
                    colSpan={c.span}
                    className="border-b border-rule px-5 py-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate"
                  >
                    {c.text}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-rule-soft transition-colors last:border-0 hover:bg-shell"
              >
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    colSpan={c.span}
                    className="px-5 py-3 text-[length:var(--text-base)] text-graphite"
                  >
                    {c.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------
   Prose sections
   ------------------------------------------------------------------ */

/** Short, uniform lines read as a list rather than as paragraphs. */
function looksLikeList(lines: string[]) {
  if (lines.length < 3) return false;
  const short = lines.filter((l) => l.length < 190).length;
  return short / lines.length > 0.75;
}

function ProseSection({
  heading,
  lines,
  index,
}: {
  heading: string | null;
  lines: string[];
  index: number;
}) {
  const asList = looksLikeList(lines);

  return (
    <Reveal from="up" className="scroll-mt-28">
      {heading && (
        <div className="mb-5">
          <p className="eyebrow mb-3">{String(index + 1).padStart(2, '0')}</p>
          <h2 className="text-[length:var(--text-2xl)]">
            {heading.replace(/:$/, '')}
          </h2>
        </div>
      )}

      <Expandable>
        {asList ? (
          <Stagger as="ul" className="space-y-0" gap={0.05}>
            {lines.map((line, i) => (
              <StaggerItem
                as="li"
                key={i}
                className="group flex gap-4 border-b border-rule-soft py-3.5 last:border-0"
              >
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/45 transition-colors group-hover:bg-brand"
                  aria-hidden
                />
                <span className="text-[length:var(--text-base)] leading-relaxed text-graphite">
                  {line}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="prose-mg">
            {lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </Expandable>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */

export function ContentBlocks({
  blocks,
  /** Skip the first section when its heading merely repeats the page title. */
  skipLeadHeading,
}: {
  blocks: Block[];
  skipLeadHeading?: string;
}) {
  const list = skipLeadHeading ? visibleBlocks(blocks, skipLeadHeading) : blocks;

  let sectionIndex = 0;

  return (
    <div className="space-y-10 sm:space-y-14">
      {list.map((block, i) => {
        if (block.type === 'table') {
          return <CurriculumTable key={i} caption={block.caption} rows={block.rows} />;
        }
        const idx = block.heading ? sectionIndex++ : sectionIndex;
        return (
          <ProseSection key={i} heading={block.heading} lines={block.lines} index={idx} />
        );
      })}
    </div>
  );
}
