import {
  Database,
  Download,
  FolderOpen,
  Plus,
  Save,
  Upload
} from 'lucide-react';
import { Button } from './ui/Button';

interface CurrentDiagram {
  id: string;
  name: string;
}

interface AppHeaderProps {
  currentDiagram: CurrentDiagram | null;
  diagramName: string;
  hasUnsavedChanges: boolean;
  serverStorageAvailable: boolean;
  onNewDiagram: () => void;
  onOpenServerStorage: () => void;
  onOpenSaveDialog: () => void;
  onOpenLoadDialog: () => void;
  onOpenImportDialog: () => void;
  onOpenExportDialog: () => void;
  onQuickSave: () => void;
}

export function AppHeader({
  currentDiagram,
  diagramName,
  hasUnsavedChanges,
  serverStorageAvailable,
  onNewDiagram,
  onOpenServerStorage,
  onOpenSaveDialog,
  onOpenLoadDialog,
  onOpenImportDialog,
  onOpenExportDialog,
  onQuickSave
}: AppHeaderProps) {
  const title = currentDiagram
    ? currentDiagram.name
    : diagramName || 'Diagramme sans titre';

  return (
    <header className="app-header">
      <div className="app-header__brand" aria-label="Sleeqy Diagram">
        <span className="app-header__mark">SD</span>
        <span className="app-header__copy">
          <span className="app-header__product">Sleeqy Diagram</span>
          <span className="app-header__title" title={title}>
            {title}
          </span>
        </span>
        {hasUnsavedChanges && <span className="app-header__status">Modifie</span>}
      </div>

      <nav className="app-header__actions" aria-label="Actions du diagramme">
        <Button onClick={onNewDiagram} title="Creer un nouveau diagramme">
          <Plus size={15} strokeWidth={2.2} />
          Nouveau
        </Button>

        {serverStorageAvailable && (
          <Button
            onClick={onOpenServerStorage}
            variant="secondary"
            title="Ouvrir le stockage serveur"
          >
            <Database size={15} strokeWidth={2.2} />
            Serveur
          </Button>
        )}

        <Button
          onClick={onOpenSaveDialog}
          variant="outline"
          title="Enregistrer dans la session"
        >
          <Save size={15} strokeWidth={2.2} />
          Enreg.
        </Button>

        <Button
          onClick={onOpenLoadDialog}
          variant="outline"
          title="Charger depuis la session"
        >
          <FolderOpen size={15} strokeWidth={2.2} />
          Charger
        </Button>

        <Button
          onClick={onOpenImportDialog}
          variant="outline"
          title="Importer un fichier JSON"
        >
          <Upload size={15} strokeWidth={2.2} />
          Import
        </Button>

        <Button
          onClick={onOpenExportDialog}
          variant="outline"
          title="Exporter le diagramme en JSON"
        >
          <Download size={15} strokeWidth={2.2} />
          Export
        </Button>

        <Button
          onClick={onQuickSave}
          disabled={!currentDiagram || !hasUnsavedChanges}
          title="Enregistrement rapide dans la session"
        >
          <Save size={15} strokeWidth={2.2} />
          Sync
        </Button>
      </nav>
    </header>
  );
}
