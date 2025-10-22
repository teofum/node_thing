import { PromptDialog } from "@/ui/prompt-dialog";
import { ImportResult } from "@/utils/project";
import { Dispatch, SetStateAction } from "react";

type ConfirmImportProps = {
  importResult: ImportResult;
  setImportResult: Dispatch<SetStateAction<ImportResult>>;
};

export function ConfirmImport({
  importResult,
  setImportResult,
}: ConfirmImportProps) {
  return (
    <PromptDialog
      trigger={null}
      title="Import project"
      description="Some project dependencies are missing"
      open={importResult !== undefined}
      onOpenChange={(open) => {
        if (!open) setImportResult(undefined);
      }}
      onConfirm={importResult?.doImport}
      confirmText="Import anyway"
    >
      <p className="text-sm/4">
        This project uses nodes that are currently unavailable:
      </p>
      <ul className="my-4 text-base/5 font-medium">
        {importResult?.missingDependencies.map((dep) => (
          <li key={dep.id} className="ml-2">
            {dep.name}
          </li>
        ))}
      </ul>
      <p className="text-sm/4 mb-2">Some layers may not display correctly.</p>
      <p className="text-sm/4">Import the project anyway?</p>
    </PromptDialog>
  );
}
