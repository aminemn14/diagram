import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ChevronDown,
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
  const canQuickSave = Boolean(currentDiagram && hasUnsavedChanges);
  const actions = [
    {
      label: 'Nouveau',
      title: 'Creer un nouveau diagramme',
      icon: <Plus size={15} strokeWidth={2.2} />,
      onSelect: onNewDiagram,
      variant: 'default' as const
    },
    ...(serverStorageAvailable
      ? [
          {
            label: 'Serveur',
            title: 'Ouvrir le stockage serveur',
            icon: <Database size={15} strokeWidth={2.2} />,
            onSelect: onOpenServerStorage,
            variant: 'secondary' as const
          }
        ]
      : []),
    {
      label: 'Enreg.',
      title: 'Enregistrer dans la session',
      icon: <Save size={15} strokeWidth={2.2} />,
      onSelect: onOpenSaveDialog,
      variant: 'outline' as const
    },
    {
      label: 'Charger',
      title: 'Charger depuis la session',
      icon: <FolderOpen size={15} strokeWidth={2.2} />,
      onSelect: onOpenLoadDialog,
      variant: 'outline' as const
    },
    {
      label: 'Import',
      title: 'Importer un fichier JSON',
      icon: <Upload size={15} strokeWidth={2.2} />,
      onSelect: onOpenImportDialog,
      variant: 'outline' as const
    },
    {
      label: 'Export',
      title: 'Exporter le diagramme en JSON',
      icon: <Download size={15} strokeWidth={2.2} />,
      onSelect: onOpenExportDialog,
      variant: 'outline' as const
    },
    {
      label: 'Sync',
      title: 'Enregistrement rapide dans la session',
      icon: <Save size={15} strokeWidth={2.2} />,
      onSelect: onQuickSave,
      variant: 'default' as const,
      disabled: !canQuickSave
    }
  ];

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

      <nav
        className="app-header__actions app-header__actions--desktop"
        aria-label="Actions du diagramme"
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={action.onSelect}
            variant={action.variant}
            disabled={action.disabled}
            title={action.title}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </nav>

      <div className="app-header__actions app-header__actions--mobile">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline" title="Afficher les actions du diagramme">
              Actions
              <ChevronDown size={15} strokeWidth={2.2} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="app-header__menu"
              align="end"
              sideOffset={8}
            >
              {actions.map((action) => (
                <DropdownMenu.Item
                  key={action.label}
                  className="app-header__menu-item"
                  disabled={action.disabled}
                  onSelect={action.onSelect}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
