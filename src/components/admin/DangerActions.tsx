"use client";

import { discardDraftAction, restoreRevisionAction } from "@/lib/cms/actions";

export function RestoreToDraftButton({ revisionId }: { revisionId: string }) {
  return (
    <form
      action={async (formData) => {
        if (
          !window.confirm(
            "Replace the current draft with this snapshot? The live site stays unchanged until you publish.",
          )
        ) {
          return;
        }
        formData.set("revisionId", revisionId);
        formData.set("confirmRestore", "1");
        await restoreRevisionAction(formData);
      }}
      className="mt-6"
    >
      <button type="submit" className="masthead-chip">
        Restore this snapshot to draft
      </button>
    </form>
  );
}

export function DiscardDraftButton() {
  return (
    <form
      action={async (formData) => {
        if (!window.confirm("Discard the draft and match the live site?")) return;
        formData.set("confirmDiscard", "1");
        await discardDraftAction(formData);
      }}
      className="mt-4"
    >
      <button type="submit" className="masthead-chip">
        Discard draft
      </button>
    </form>
  );
}

export function RestoreButtons({
  revisionId,
  restore,
  restoreAndPublish,
}: {
  revisionId: string;
  restore: (formData: FormData) => Promise<void>;
  restoreAndPublish: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <form
        action={async (formData) => {
          if (
            !window.confirm(
              "Replace the current draft with this snapshot? The live site stays unchanged until you publish.",
            )
          ) {
            return;
          }
          formData.set("revisionId", revisionId);
          formData.set("confirmRestore", "1");
          await restore(formData);
        }}
      >
        <button type="submit" className="masthead-chip">
          Restore to draft
        </button>
      </form>
      <form
        action={async (formData) => {
          if (
            !window.confirm(
              "Restore this snapshot into draft and publish it to the live site? This replaces the current public revision.",
            )
          ) {
            return;
          }
          formData.set("revisionId", revisionId);
          formData.set("confirmPublish", "1");
          await restoreAndPublish(formData);
        }}
      >
        <button type="submit" className="masthead-chip masthead-chip-primary">
          Restore and publish
        </button>
      </form>
    </div>
  );
}
