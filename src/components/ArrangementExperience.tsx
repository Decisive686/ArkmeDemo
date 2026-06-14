import React from "react";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";
import type {
  ArrangementApiSettings,
  ArrangementDraft,
  ArrangementFocus,
  ArrangementItem,
  ArrangementSource,
} from "@/types/arrangement";

type ArrangementEntryProps = {
  onOpen: () => void;
};

type ArrangementCenterScreenProps = {
  arrangements: ArrangementItem[];
  apiSettings: ArrangementApiSettings;
  onBack: () => void;
  onOpenArrangement: (arrangement: ArrangementItem) => void;
  onCreateArrangement: () => void;
  onOpenApiSettings: () => void;
  onPatchArrangement: (uid: string, patch: Partial<ArrangementItem>) => void;
};

type ArrangementDetailScreenProps = {
  arrangement: ArrangementItem;
  onBack: () => void;
  onEdit: (arrangement: ArrangementItem) => void;
  onOpenSource?: (source: ArrangementSource) => void;
  onPatchArrangement: (uid: string, patch: Partial<ArrangementItem>) => void;
};

type ArrangementEditorSheetProps = {
  initialDraft: ArrangementDraft;
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (draft: ArrangementDraft) => void;
};

type ArrangementCandidateSheetProps = {
  draft: ArrangementDraft;
  onClose: () => void;
  onConfirm: () => void;
};

type ArrangementApiSettingsScreenProps = {
  settings: ArrangementApiSettings;
  onBack: () => void;
  onSave: (settings: ArrangementApiSettings) => void;
};

const focusLabels: Record<ArrangementFocus, string> = {
  today: "今日关注",
  recent: "近期",
  confirm: "待确认",
  later: "以后再说",
  quiet: "低打扰",
};

export function ArrangementEntry({ onOpen }: ArrangementEntryProps) {
  return (
    <div className="shrink-0 bg-bg px-4 pb-2 pt-1">
      <button
        type="button"
        className="inline-flex h-9 max-w-full items-center rounded-full border border-[var(--record-card-border)] bg-[var(--record-card-bg)] px-3 text-left transition hover:bg-[var(--record-card-hover-bg)] active:scale-[0.98]"
        onClick={onOpen}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <path d="M3 10h18" />
            <rect x="3" y="4" width="18" height="18" rx="2" />
          </svg>
        </span>
        <span className="ml-2 min-w-0">
          <span className="block truncate text-[14px] font-medium leading-5 text-text">
            安排
          </span>
        </span>
        <ChevronRightIcon className="ml-1 h-3.5 w-3.5 shrink-0 text-primary" />
      </button>
    </div>
  );
}

export function ArrangementCenterScreen({
  arrangements,
  apiSettings,
  onBack,
  onOpenArrangement,
  onCreateArrangement,
  onOpenApiSettings,
}: ArrangementCenterScreenProps) {
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const aiSettingsLabel = apiSettings.aiEnabled
    ? "AI 识别设置已开启"
    : "AI 识别设置未开启";
  const aiRecognitionArrangements = arrangements.filter(isAiRecognitionArrangement);
  const formalArrangements = arrangements.filter(isFormalArrangement);
  const archivedArrangements = arrangements.filter(isArchivedArrangement);

  return (
    <div className="relative flex h-full flex-col bg-bg">
      <ArrangementHeader
        title="安排"
        onBack={onBack}
        rightAction={
          <ArchiveHeaderButton
            onClick={() => setIsArchiveOpen(true)}
          />
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <div className="space-y-4">
          <ArrangementHomeSection
            title="AI 识别"
            emptyText="暂无 AI 识别安排"
            items={aiRecognitionArrangements}
            tone="ai"
            onOpenArrangement={onOpenArrangement}
            action={
              <ArrangementSectionIconButton
                label={aiSettingsLabel}
                onClick={onOpenApiSettings}
              >
                <BotIcon className="h-5 w-5" />
              </ArrangementSectionIconButton>
            }
          />
          <ArrangementHomeSection
            title="正式安排"
            emptyText="暂无正式安排"
            items={formalArrangements}
            tone="formal"
            onOpenArrangement={onOpenArrangement}
            action={
              <ArrangementSectionIconButton
                label="手动创建安排"
                onClick={onCreateArrangement}
              >
                <PlusIcon className="h-5 w-5" />
              </ArrangementSectionIconButton>
            }
          />
        </div>
      </div>
      {isArchiveOpen ? (
        <ArrangementArchiveSheet
          arrangements={archivedArrangements}
          onClose={() => setIsArchiveOpen(false)}
          onOpenArrangement={(arrangement) => {
            setIsArchiveOpen(false);
            onOpenArrangement(arrangement);
          }}
        />
      ) : null}
    </div>
  );
}

function ArrangementHomeSection({
  title,
  items,
  emptyText,
  action,
  tone,
  muted,
  onOpenArrangement,
}: {
  title: string;
  items: ArrangementItem[];
  emptyText: string;
  action: React.ReactNode;
  tone: "ai" | "formal" | "archived";
  muted?: boolean;
  onOpenArrangement: (arrangement: ArrangementItem) => void;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "h-5 w-1 shrink-0 rounded-full",
              tone === "formal" && "bg-primary",
              tone === "ai" && "bg-[var(--overview-entry-tag-bg)]",
              tone === "archived" && "bg-fill-3"
            )}
            aria-hidden="true"
          />
          <h2
            className={cn(
              "truncate text-[15px] font-semibold leading-5",
              muted ? "text-text-tertiary" : "text-text"
            )}
          >
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-4",
              tone === "formal" && "bg-primary text-on-primary",
              tone === "ai" && "bg-[var(--overview-entry-tag-bg)] text-text-muted",
              tone === "archived" && "bg-fill-3 text-text-disabled"
            )}
          >
            {items.length}
          </span>
          {action}
        </div>
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((arrangement) => (
            <ArrangementTodoRow
              key={arrangement.uid}
              arrangement={arrangement}
              tone={tone}
              muted={muted}
              onOpen={() => onOpenArrangement(arrangement)}
            />
          ))
        ) : (
          <p className="rounded-[14px] bg-surface px-4 py-3 text-[13px] leading-5 text-text-disabled shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            {emptyText}
          </p>
        )}
      </div>
    </section>
  );
}

function ArrangementTodoRow({
  arrangement,
  tone,
  muted,
  onOpen,
}: {
  arrangement: ArrangementItem;
  tone: "ai" | "formal" | "archived";
  muted?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="relative flex min-h-[56px] w-full items-center overflow-hidden rounded-[14px] border border-[var(--record-card-border)] bg-surface px-4 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:bg-[var(--record-card-hover-bg)] active:scale-[0.99]"
      onClick={onOpen}
    >
      <span
        className={cn(
          "absolute bottom-0 left-0 top-0 w-1",
          tone === "formal" && "bg-primary",
          tone === "ai" && "bg-[var(--overview-entry-tag-bg)]",
          tone === "archived" && "bg-fill-3"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[15px] font-medium leading-5",
          muted ? "text-text-tertiary" : "text-text"
        )}
      >
        {arrangement.title}
      </span>
    </button>
  );
}

function ArrangementSectionIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-hover-overlay hover:text-text active:scale-[0.96]"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function ArchiveHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-hover-overlay hover:text-text active:scale-[0.96]"
      onClick={onClick}
      aria-label="查看已归档安排"
      title="查看已归档安排"
    >
      <ArchiveBoxIcon className="h-5 w-5" />
    </button>
  );
}

function ArrangementArchiveSheet({
  arrangements,
  onClose,
  onOpenArrangement,
}: {
  arrangements: ArrangementItem[];
  onClose: () => void;
  onOpenArrangement: (arrangement: ArrangementItem) => void;
}) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-end bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-label="已归档安排"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="关闭已归档记录"
      />
      <section className="relative w-full rounded-t-[22px] bg-bg px-4 pb-6 pt-4 shadow-[0_-16px_32px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold leading-6 text-text">
              已归档
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-text-tertiary">
              历史记录
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-hover-overlay active:scale-[0.96]"
            onClick={onClose}
            aria-label="关闭"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pb-1">
          {arrangements.length > 0 ? (
            arrangements.map((arrangement) => (
              <ArrangementTodoRow
                key={arrangement.uid}
                arrangement={arrangement}
                tone="archived"
                muted
                onOpen={() => onOpenArrangement(arrangement)}
              />
            ))
          ) : (
            <p className="rounded-[14px] bg-surface px-4 py-3 text-[13px] leading-5 text-text-disabled shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
              暂无归档记录
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="7"
        width="14"
        height="12"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.5 12.5h.01M15.5 12.5h.01M10 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArchiveBoxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 8h14M7 8v10.5h10V8M9 5h6l1.5 3h-9L9 5ZM10 12h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function isAiRecognitionArrangement(arrangement: ArrangementItem) {
  return !isArchivedArrangement(arrangement) && arrangement.focus === "confirm";
}

function isFormalArrangement(arrangement: ArrangementItem) {
  return !isArchivedArrangement(arrangement) && !isAiRecognitionArrangement(arrangement);
}

function isArchivedArrangement(arrangement: ArrangementItem) {
  return (
    arrangement.status === "archived" ||
    arrangement.status === "done" ||
    arrangement.focus === "later" ||
    arrangement.focus === "quiet"
  );
}

export function ArrangementDetailScreen({
  arrangement,
  onBack,
  onEdit,
  onOpenSource,
  onPatchArrangement,
}: ArrangementDetailScreenProps) {
  if (isAiRecognitionArrangement(arrangement)) {
    return (
      <ArrangementCandidateDetailScreen
        arrangement={arrangement}
        onBack={onBack}
        onOpenSource={onOpenSource}
        onPatchArrangement={onPatchArrangement}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg [&_article>p:first-child]:hidden">
      <ArrangementHeader
        title="安排详情"
        onBack={onBack}
        rightAction={<ArrangementDetailCloseButton onClick={onBack} />}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <article className="rounded-[18px] bg-surface px-4 py-4 shadow-[var(--mine-card-shadow)] [&>p:first-child]:hidden">
          <h1 className="whitespace-pre-wrap text-[20px] font-semibold leading-7 text-text">
            {arrangement.title}
          </h1>
          <ArrangementDetailFields arrangement={arrangement} onOpenSource={onOpenSource} />

          <div className="hidden items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="whitespace-pre-wrap text-[20px] font-semibold leading-7 text-text">
                {arrangement.title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="rounded-full px-2 py-1 text-[12px] leading-4 text-text-tertiary transition hover:bg-hover-overlay hover:text-text active:scale-[0.96]"
                onClick={() => onEdit(arrangement)}
              >
                编辑
              </button>
            </div>
          </div>

          <div className="hidden mt-4 grid grid-cols-2 gap-2">
            <ArrangementInfoPill label="时间" value={arrangement.timeText || "待补充"} />
            <ArrangementInfoPill label="地点" value={arrangement.location || "未确定"} />
            <ArrangementInfoPill
              label="相关人"
              value={arrangement.people.length > 0 ? arrangement.people.join("、") : "我"}
            />
            <ArrangementInfoPill
              label="执行方式"
              value={executionTypeLabel(arrangement.executionType)}
            />
          </div>
        </article>

        <section className="hidden mt-3 rounded-[16px] bg-surface px-4 py-4 shadow-[var(--mine-card-shadow)]">
          <h2 className="text-[15px] font-semibold leading-5 text-text">
            来源和识别依据
          </h2>
          <ArrangementSourceContext
            arrangement={arrangement}
            onOpenSource={onOpenSource}
          />
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2">
          <ArrangementActionButton
            label="完成"
            onClick={() =>
              onPatchArrangement(arrangement.uid, {
                status: "done",
                focus: "quiet",
              })
            }
          />
          <ArrangementActionButton
            label="归档"
            muted
            onClick={() =>
              onPatchArrangement(arrangement.uid, {
                status: "archived",
                focus: "quiet",
              })
            }
          />
        </section>
      </div>
    </div>
  );
}

function ArrangementCandidateDetailScreen({
  arrangement,
  onBack,
  onOpenSource,
  onPatchArrangement,
}: {
  arrangement: ArrangementItem;
  onBack: () => void;
  onOpenSource?: (source: ArrangementSource) => void;
  onPatchArrangement: (uid: string, patch: Partial<ArrangementItem>) => void;
}) {
  const arrangeCandidate = () => {
    onPatchArrangement(arrangement.uid, {
      status: "active",
      focus: "recent",
    });
    onBack();
  };

  const ignoreCandidate = () => {
    onPatchArrangement(arrangement.uid, {
      status: "archived",
      focus: "quiet",
    });
    onBack();
  };

  return (
    <div className="flex h-full flex-col bg-bg [&_article>p:first-child]:hidden">
      <ArrangementHeader
        title="安排详情"
        onBack={onBack}
        rightAction={<ArrangementDetailCloseButton onClick={onBack} />}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <article className="rounded-[18px] bg-surface px-4 py-4 shadow-[var(--mine-card-shadow)]">
          <p className="text-[12px] leading-4 text-primary">候选安排</p>
          <h1 className="whitespace-pre-wrap text-[20px] font-semibold leading-7 text-text">
            {arrangement.title}
          </h1>
          <ArrangementDetailFields arrangement={arrangement} onOpenSource={onOpenSource} />

          <h1 className="hidden mt-1 whitespace-pre-wrap text-[20px] font-semibold leading-7 text-text">
            {arrangement.title}
          </h1>
          <p className="hidden mt-2 text-[13px] leading-6 text-text-muted">
            AI 从对话里识别到这件事。你可以把它加入安排，也可以忽略。
          </p>

          <div className="hidden mt-4 grid grid-cols-2 gap-2">
            <ArrangementInfoPill label="时间" value={arrangement.timeText || "待补充"} />
            <ArrangementInfoPill label="地点" value={arrangement.location || "未确定"} />
            <ArrangementInfoPill
              label="相关人"
              value={arrangement.people.length > 0 ? arrangement.people.join("、") : "我"}
            />
            <ArrangementInfoPill
              label="执行方式"
              value={executionTypeLabel(arrangement.executionType)}
            />
          </div>
        </article>

        <section className="hidden mt-3 rounded-[16px] bg-surface px-4 py-4 shadow-[var(--mine-card-shadow)]">
          <h2 className="text-[15px] font-semibold leading-5 text-text">
            来源和识别依据
          </h2>
          <ArrangementSourceContext
            arrangement={arrangement}
            onOpenSource={onOpenSource}
          />
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2">
          <ArrangementActionButton
            label="忽略"
            muted
            className="order-2"
            onClick={ignoreCandidate}
          />
          <ArrangementActionButton
            label="安排"
            className="order-1"
            onClick={arrangeCandidate}
          />
        </section>
      </div>
    </div>
  );
}

function ArrangementSourceContext({
  arrangement,
  onOpenSource,
}: {
  arrangement: ArrangementItem;
  onOpenSource?: (source: ArrangementSource) => void;
}) {
  const canOpenSource = Boolean(onOpenSource && arrangement.source.conversation);

  return (
    <div className="mt-3 space-y-2">
      <div className="rounded-[12px] border border-[var(--record-topic-border)] px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[12px] leading-4 text-text-tertiary">
            {arrangement.source.label}
          </p>
          <span className="shrink-0 text-[11px] leading-4 text-text-tertiary">
            {formatArrangementTime(arrangement.createdAt)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-[14px] leading-6 text-text">
          {arrangement.source.snippet || "没有关联原文。"}
        </p>
      </div>

      <button
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] border px-3 text-left text-[13px] leading-5 transition active:scale-[0.99]",
          canOpenSource
            ? "border-primary/25 bg-primary-soft text-primary hover:bg-primary-soft/80"
            : "cursor-default border-border bg-bg text-text-tertiary"
        )}
        disabled={!canOpenSource}
        onClick={() => onOpenSource?.(arrangement.source)}
      >
        <span>{canOpenSource ? "定位到原对话上下文" : "暂无可定位的原对话"}</span>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}

function formatArrangementTime(value: number | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ArrangementEditorSheet({
  initialDraft,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: ArrangementEditorSheetProps) {
  const [draft, setDraft] = React.useState(initialDraft);

  const updateDraft = <Key extends keyof ArrangementDraft>(
    key: Key,
    value: ArrangementDraft[Key]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-label="关闭安排编辑"
      />
      <section className="relative z-10 flex max-h-[88%] w-full flex-col overflow-hidden rounded-t-[18px] border border-border-light bg-[var(--dialog-bg)] shadow-[0_-12px_36px_rgba(0,0,0,0.18)]">
        <header className="shrink-0 border-b border-border-light px-4 pb-3 pt-2.5">
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-fill-2" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold leading-6 text-text">{title}</h2>
            <button
              type="button"
              className="text-[14px] text-text-tertiary"
              onClick={onClose}
            >
              取消
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ArrangementTextField
            label="标题"
            value={draft.title}
            onChange={(value) => updateDraft("title", value)}
            placeholder="例如：后天去医院检查身体"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ArrangementTextField
              label="时间"
              value={draft.timeText}
              onChange={(value) => updateDraft("timeText", value)}
              placeholder="明天 / 后天 / 最近"
            />
            <ArrangementTextField
              label="地点"
              value={draft.location}
              onChange={(value) => updateDraft("location", value)}
              placeholder="医院 / 公司"
            />
          </div>
          <ArrangementTextField
            className="mt-3"
            label="相关人"
            value={draft.people.join("、")}
            onChange={(value) =>
              updateDraft(
                "people",
                value
                  .split(/、|,|，|\s+/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
            placeholder="我、对方、家人"
          />
          <ArrangementTextArea
            className="mt-3"
            label="备注"
            value={draft.note}
            onChange={(value) => updateDraft("note", value)}
            placeholder="补充一下为什么要关注这件事"
          />

          <div className="mt-4">
            <p className="mb-2 text-[13px] font-medium leading-5 text-text">
              关注方式
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["today", "recent", "confirm", "later", "quiet"] as ArrangementFocus[]).map(
                (focus) => (
                  <button
                    key={focus}
                    type="button"
                    className={cn(
                      "min-h-10 rounded-[10px] border px-2 text-[12px] leading-4 transition active:scale-[0.98]",
                      draft.focus === focus
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface text-text-muted"
                    )}
                    onClick={() => updateDraft("focus", focus)}
                  >
                    {focusLabels[focus]}
                  </button>
                )
              )}
            </div>
          </div>

          {draft.source.snippet && (
            <div className="mt-4 rounded-[12px] bg-bg px-3 py-3">
              <p className="text-[12px] leading-4 text-text-tertiary">
                来源：{draft.source.label}
              </p>
              <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-text-muted">
                {draft.source.snippet}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border-light px-4 py-3">
          <button
            type="button"
            className="min-h-11 w-full rounded-full bg-primary text-[15px] font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-50"
            disabled={!draft.title.trim()}
            onClick={() => onSubmit({ ...draft, title: draft.title.trim() })}
          >
            {submitLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function ArrangementCandidateSheet({
  draft,
  onClose,
  onConfirm,
}: ArrangementCandidateSheetProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-label="忽略候选安排"
      />
      <section className="relative z-10 w-full rounded-t-[18px] border border-border-light bg-[var(--dialog-bg)] px-4 pb-4 pt-2.5 shadow-[0_-12px_36px_rgba(0,0,0,0.18)]">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-fill-2" />
        <p className="text-[12px] leading-4 text-primary">AI 识别到一条候选安排</p>
        <h2 className="mt-1 text-[18px] font-semibold leading-7 text-text">
          {draft.title}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ArrangementInfoPill label="时间" value={draft.timeText || "待确认"} />
          <ArrangementInfoPill label="地点" value={draft.location || "未设置"} />
        </div>
        {draft.source.snippet && (
          <p className="mt-3 rounded-[12px] bg-bg px-3 py-2 text-[13px] leading-5 text-text-muted">
            {draft.source.snippet}
          </p>
        )}
        <p className="mt-2 text-[11px] leading-5 text-text-tertiary">
          这只是候选结果，不会静默进入安排。你可以安排，或者忽略。
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-10 rounded-full border border-red-200 bg-red-50 text-[13px] font-medium text-red-600"
            onClick={onClose}
          >
            忽略
          </button>
          <button
            type="button"
            className="min-h-10 rounded-full bg-primary text-[13px] font-semibold text-on-primary"
            onClick={onConfirm}
          >
            安排
          </button>
        </div>
      </section>
    </div>
  );
}

export function ArrangementApiSettingsScreen({
  settings,
  onBack,
  onSave,
}: ArrangementApiSettingsScreenProps) {
  const [draft, setDraft] = React.useState(settings);

  const updateDraft = <Key extends keyof ArrangementApiSettings>(
    key: Key,
    value: ArrangementApiSettings[Key]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <ArrangementHeader title="安排 AI 设置" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <section className="rounded-[16px] bg-surface px-4 py-4 shadow-[var(--mine-card-shadow)]">
          <h1 className="text-[17px] font-semibold leading-6 text-text">
            使用自己的模型能力
          </h1>
          <p className="mt-1 text-[12px] leading-5 text-text-tertiary">
            Demo 先保存配置并用本地规则模拟候选识别；真实调用可复用这里的设置和确认流。
          </p>
          <div className="mt-4 space-y-3">
            <ArrangementTextField
              label="Provider"
              value={draft.provider}
              onChange={(value) => updateDraft("provider", value)}
              placeholder="OpenAI compatible"
            />
            <ArrangementTextField
              label="Base URL"
              value={draft.baseUrl}
              onChange={(value) => updateDraft("baseUrl", value)}
              placeholder="https://api.example.com/v1"
            />
            <ArrangementTextField
              label="Model"
              value={draft.model}
              onChange={(value) => updateDraft("model", value)}
              placeholder="gpt-4.1-mini"
            />
            <ArrangementTextField
              label="API Key"
              value={draft.apiKey}
              onChange={(value) => updateDraft("apiKey", value)}
              placeholder="sk-..."
              type="password"
            />
          </div>
        </section>

        <section className="mt-3 rounded-[16px] bg-surface px-4 py-3 shadow-[var(--mine-card-shadow)]">
          <ArrangementSwitch
            title="启用 AI 识别"
            description="从自聊、私聊和群聊内容中生成候选安排。"
            checked={draft.aiEnabled}
            onChange={(checked) => updateDraft("aiEnabled", checked)}
          />
          <ArrangementSwitch
            title="自动创建"
            description="当前建议保持关闭，让候选安排先由用户确认。"
            checked={draft.autoCreate}
            onChange={(checked) => updateDraft("autoCreate", checked)}
          />
        </section>

        <button
          type="button"
          className="mt-4 min-h-11 w-full rounded-full bg-primary text-[15px] font-semibold text-on-primary transition active:scale-[0.98]"
          onClick={() => onSave(draft)}
        >
          保存设置
        </button>
      </div>
    </div>
  );
}

function ArrangementHeader({
  title,
  onBack,
  rightAction,
}: {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}) {
  const { t } = usePreferences();

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border-light bg-bg px-2">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-hover-overlay active:scale-[0.96]"
        onClick={onBack}
        aria-label={t("common.back")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="ml-1 min-w-0 flex-1 truncate text-[17px] font-semibold leading-5 text-text">
        {title}
      </h1>
      {rightAction ? (
        <div className="ml-2 flex h-10 shrink-0 items-center">{rightAction}</div>
      ) : null}
    </header>
  );
}

function ArrangementInfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-bg px-3 py-2">
      <p className="text-[11px] leading-4 text-text-tertiary">{label}</p>
      <p className="mt-0.5 truncate text-[13px] leading-5 text-text">{value}</p>
    </div>
  );
}

function ArrangementDetailCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-hover-overlay hover:text-text active:scale-[0.96]"
      onClick={onClick}
      aria-label="关闭安排详情"
      title="关闭安排详情"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );
}

function ArrangementDetailFields({
  arrangement,
  onOpenSource,
}: {
  arrangement: ArrangementItem;
  onOpenSource?: (source: ArrangementSource) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-border-light bg-bg">
      <ArrangementDetailFieldRow label="时间" value={arrangement.timeText || "待补充"} />
      <ArrangementDetailFieldRow label="地点" value={arrangement.location || "未确定"} />
      <ArrangementDetailFieldRow
        label="相关人"
        value={arrangement.people.length > 0 ? arrangement.people.join("、") : "我"}
      />
      <ArrangementSourceContextRow arrangement={arrangement} onOpenSource={onOpenSource} />
    </div>
  );
}

function ArrangementDetailFieldRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border-light px-4 py-3 last:border-b-0">
      <span className="w-16 shrink-0 text-[13px] leading-5 text-text-tertiary">{label}</span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap text-[14px] leading-5 text-text">
        {value}
      </span>
    </div>
  );
}

function ArrangementSourceContextRow({
  arrangement,
  onOpenSource,
}: {
  arrangement: ArrangementItem;
  onOpenSource?: (source: ArrangementSource) => void;
}) {
  const canOpenSource = Boolean(onOpenSource && arrangement.source.conversation);

  return (
    <button
      type="button"
      className={cn(
        "flex min-h-12 w-full items-center gap-4 px-4 py-3 text-left transition active:scale-[0.99]",
        canOpenSource ? "text-text hover:bg-hover-overlay" : "cursor-default text-text"
      )}
      disabled={!canOpenSource}
      onClick={() => onOpenSource?.(arrangement.source)}
    >
      <span className="w-16 shrink-0 text-[13px] leading-5 text-text-tertiary">
        定位上下文
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-text">
        {arrangement.source.label || "查看来源"}
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-tertiary" />
    </button>
  );
}

function ArrangementActionButton({
  label,
  muted,
  tone,
  className,
  onClick,
}: {
  label: string;
  muted?: boolean;
  tone?: "primary" | "muted" | "danger";
  className?: string;
  onClick: () => void;
}) {
  const buttonTone = tone ?? (muted ? "muted" : "primary");

  return (
    <button
      type="button"
      className={cn(
        "min-h-11 rounded-[12px] text-[14px] font-medium transition active:scale-[0.98]",
        buttonTone === "primary" && "bg-primary text-on-primary",
        buttonTone === "muted" && "border border-border bg-surface text-text-muted",
        buttonTone === "danger" && "border border-red-200 bg-red-50 text-red-600",
        className
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ArrangementTextField({
  label,
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[12px] leading-4 text-text-tertiary">
        {label}
      </span>
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[12px] bg-bg px-3 text-[14px] text-text outline-none placeholder:text-input-placeholder focus:bg-input-bg-focus"
      />
    </label>
  );
}

function ArrangementTextArea({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[12px] leading-4 text-text-tertiary">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-[12px] bg-bg px-3 py-2.5 text-[14px] leading-5 text-text outline-none placeholder:text-input-placeholder focus:bg-input-bg-focus"
      />
    </label>
  );
}

function ArrangementSwitch({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex min-h-[62px] w-full items-center border-b border-border-light py-2 text-left last:border-b-0"
      onClick={() => onChange(!checked)}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium leading-5 text-text">{title}</p>
        <p className="mt-0.5 text-[12px] leading-4 text-text-tertiary">
          {description}
        </p>
      </div>
      <span
        className={cn(
          "ml-3 flex h-7 w-12 items-center rounded-full p-0.5 transition",
          checked ? "bg-primary" : "bg-fill-3"
        )}
      >
        <span
          className={cn(
            "h-6 w-6 rounded-full bg-white transition",
            checked && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function executionTypeLabel(value: ArrangementItem["executionType"]) {
  if (value === "aiAuto") return "AI 可代办";
  if (value === "aiAssist") return "AI 可先帮忙";
  return "需要我自己做";
}
