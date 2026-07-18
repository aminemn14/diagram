import { useState, useEffect, useRef } from 'react';
import { Isoflow } from 'fossflow';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import azureIsopack from '@isoflow/isopacks/dist/azure';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';
import { DiagramData, mergeDiagramData, extractSavableData } from './diagramUtils';
import { StorageManager } from './StorageManager';
import { DiagramManager } from './components/DiagramManager';
import { storageManager } from './services/storageService';
import './App.css';

const icons = flattenCollections([
  isoflowIsopack,
  awsIsopack,
  azureIsopack,
  gcpIsopack,
  kubernetesIsopack
]);


interface SavedDiagram {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | null>(null);
  const [diagramName, setDiagramName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fossflowKey, setFossflowKey] = useState(0); // Key to force re-render of FossFLOW
  const [currentModel, setCurrentModel] = useState<DiagramData | null>(null); // Store current model state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showDiagramManager, setShowDiagramManager] = useState(false);
  const [serverStorageAvailable, setServerStorageAvailable] = useState(false);
  
  // Initialize with empty diagram data
  // Create default colors for connectors
  const defaultColors = [
    { id: 'blue', value: '#0066cc' },
    { id: 'green', value: '#00aa00' },
    { id: 'red', value: '#cc0000' },
    { id: 'orange', value: '#ff9900' },
    { id: 'purple', value: '#9900cc' },
    { id: 'black', value: '#000000' },
    { id: 'gray', value: '#666666' }
  ];
  
  
  const [diagramData, setDiagramData] = useState<DiagramData>(() => {
    // Initialize with last opened data if available
    const lastOpenedData = localStorage.getItem('fossflow-last-opened-data');
    if (lastOpenedData) {
      try {
        const data = JSON.parse(lastOpenedData);
        const importedIcons = (data.icons || []).filter((icon: any) => icon.collection === 'imported');
        const mergedIcons = [...icons, ...importedIcons];
        return {
          ...data,
          icons: mergedIcons,
          colors: data.colors?.length ? data.colors : defaultColors,
          fitToScreen: data.fitToScreen !== false
        };
      } catch (e) {
        console.error('Impossible de charger les donnees du dernier diagramme ouvert :', e);
      }
    }
    
    // Default state if no saved data
    return {
      title: 'Diagramme sans titre',
      icons: icons,
      colors: defaultColors,
      items: [],
      views: [],
      fitToScreen: true
    };
  });

  // Check for server storage availability
  useEffect(() => {
    storageManager.initialize().then(() => {
      setServerStorageAvailable(storageManager.isServerStorage());
    }).catch(console.error);
  }, []);

  // Load diagrams from localStorage on component mount
  useEffect(() => {
    const savedDiagrams = localStorage.getItem('fossflow-diagrams');
    if (savedDiagrams) {
      setDiagrams(JSON.parse(savedDiagrams));
    }
    
    // Load last opened diagram metadata (data is already loaded in state initialization)
    const lastOpenedId = localStorage.getItem('fossflow-last-opened');
    
    if (lastOpenedId && savedDiagrams) {
      try {
        const allDiagrams = JSON.parse(savedDiagrams);
        const lastDiagram = allDiagrams.find((d: SavedDiagram) => d.id === lastOpenedId);
        if (lastDiagram) {
          setCurrentDiagram(lastDiagram);
          setDiagramName(lastDiagram.name);
          // Also set currentModel to match diagramData
          setCurrentModel(diagramData);
        }
      } catch (e) {
        console.error('Impossible de restaurer les metadonnees du dernier diagramme :', e);
      }
    }
  }, [diagramData]);

    // Save diagrams to localStorage whenever they change
  useEffect(() => {
    try {
      // Store diagrams without the full icon data
      const diagramsToStore = diagrams.map(d => ({
        ...d,
        data: {
          ...d.data,
          icons: [] // Don't store icons with each diagram
        }
      }));
      localStorage.setItem('fossflow-diagrams', JSON.stringify(diagramsToStore));
    } catch (e) {
      console.error("Impossible d'enregistrer les diagrammes :", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Quota de stockage depasse. Exportez les diagrammes importants et liberez de l'espace.");
      }
    }
  }, [diagrams]);

  const saveDiagram = () => {
    if (!diagramName.trim()) {
      alert('Veuillez saisir un nom de diagramme');
      return;
    }

    // Check if a diagram with this name already exists (excluding current)
    const existingDiagram = diagrams.find(d => 
      d.name === diagramName.trim() && d.id !== currentDiagram?.id
    );
    
    if (existingDiagram) {
      const confirmOverwrite = window.confirm(
        `Un diagramme nomme "${diagramName}" existe deja dans cette session. Il sera remplace. Voulez-vous continuer ?`
      );
      if (!confirmOverwrite) {
        return;
      }
    }

    // Construct save data - include only imported icons
    const importedIcons = (currentModel?.icons || diagramData.icons || [])
      .filter(icon => icon.collection === 'imported');
    
    const savedData = {
      title: diagramName,
      icons: importedIcons, // Save only imported icons with diagram
      colors: currentModel?.colors || diagramData.colors || [],
      items: currentModel?.items || diagramData.items || [],
      views: currentModel?.views || diagramData.views || [],
      fitToScreen: true
    };
    

    const newDiagram: SavedDiagram = {
      id: currentDiagram?.id || Date.now().toString(),
      name: diagramName,
      data: savedData,
      createdAt: currentDiagram?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (currentDiagram) {
      // Update existing diagram
      setDiagrams(diagrams.map(d => d.id === currentDiagram.id ? newDiagram : d));
    } else if (existingDiagram) {
      // Replace existing diagram with same name
      setDiagrams(diagrams.map(d => d.id === existingDiagram.id ? { ...newDiagram, id: existingDiagram.id, createdAt: existingDiagram.createdAt } : d));
      newDiagram.id = existingDiagram.id;
      newDiagram.createdAt = existingDiagram.createdAt;
    } else {
      // Add new diagram
      setDiagrams([...diagrams, newDiagram]);
    }

    setCurrentDiagram(newDiagram);
    setShowSaveDialog(false);
    setHasUnsavedChanges(false);
    setLastAutoSave(new Date());
    
    // Save as last opened
    try {
      localStorage.setItem('fossflow-last-opened', newDiagram.id);
      localStorage.setItem('fossflow-last-opened-data', JSON.stringify(newDiagram.data));
    } catch (e) {
      console.error("Impossible d'enregistrer le diagramme :", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('Stockage plein. Ouverture du gestionnaire de stockage...');
        setShowStorageManager(true);
      }
    }
  };

  const loadDiagram = (diagram: SavedDiagram) => {
    if (hasUnsavedChanges && !window.confirm('Vous avez des modifications non enregistrees. Continuer le chargement ?')) {
      return;
    }
    
    // Merge imported icons with default icon set
    const importedIcons = (diagram.data.icons || []).filter((icon: any) => icon.collection === 'imported');
    const mergedIcons = [...icons, ...importedIcons];
    const dataWithIcons = {
      ...diagram.data,
      icons: mergedIcons
    };
    
    setCurrentDiagram(diagram);
    setDiagramName(diagram.name);
    setDiagramData(dataWithIcons);
    setCurrentModel(dataWithIcons);
    setFossflowKey(prev => prev + 1); // Force re-render of FossFLOW
    setShowLoadDialog(false);
    setHasUnsavedChanges(false);
    
    // Save as last opened (without icons)
    try {
      localStorage.setItem('fossflow-last-opened', diagram.id);
      localStorage.setItem('fossflow-last-opened-data', JSON.stringify(diagram.data));
    } catch (e) {
      console.error("Impossible d'enregistrer le dernier diagramme ouvert :", e);
    }
  };

  const deleteDiagram = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce diagramme ?')) {
      setDiagrams(diagrams.filter(d => d.id !== id));
      if (currentDiagram?.id === id) {
        setCurrentDiagram(null);
        setDiagramName('');
      }
    }
  };

  const newDiagram = () => {
    const message = hasUnsavedChanges 
      ? "Vous avez des modifications non enregistrees. Exportez d'abord votre diagramme pour le sauvegarder. Continuer ?"
      : 'Creer un nouveau diagramme ?';
      
    if (window.confirm(message)) {
      const emptyDiagram: DiagramData = {
        title: 'Diagramme sans titre',
        icons: icons, // Always include full icon set
        colors: defaultColors,
        items: [],
        views: [],
        fitToScreen: true
      };
      setCurrentDiagram(null);
      setDiagramName('');
      setDiagramData(emptyDiagram);
      setCurrentModel(emptyDiagram); // Reset current model too
      setFossflowKey(prev => prev + 1); // Force re-render of FossFLOW
      setHasUnsavedChanges(false);
      
      // Clear last opened
      localStorage.removeItem('fossflow-last-opened');
      localStorage.removeItem('fossflow-last-opened-data');
    }
  };

  const handleModelUpdated = (model: any) => {
    // Store the current model state whenever it updates
    // The model from Isoflow contains the COMPLETE state including all icons
    
    // Simply store the complete model as-is since it has everything
    const updatedModel = {
      title: model.title || diagramName || 'Sans titre',
      icons: model.icons || [], // This already includes ALL icons (default + imported)
      colors: model.colors || defaultColors,
      items: model.items || [],
      views: model.views || [],
      fitToScreen: true
    };
    
    setCurrentModel(updatedModel);
    setDiagramData(updatedModel);
    setHasUnsavedChanges(true);
  };

  const exportDiagram = () => {
    // Use the most recent model data - prefer currentModel as it gets updated by handleModelUpdated
    const modelToExport = currentModel || diagramData;
    
    // Get ALL icons from the current model (which includes both default and imported)
    const allModelIcons = modelToExport.icons || [];
    
    // For safety, also check diagramData for any imported icons not in currentModel
    const diagramImportedIcons = (diagramData.icons || []).filter(icon => icon.collection === 'imported');
    
    // Create a map to deduplicate icons by ID, preferring the ones from currentModel
    const iconMap = new Map();
    
    // First add all icons from the model (includes defaults + imported)
    allModelIcons.forEach(icon => {
      iconMap.set(icon.id, icon);
    });
    
    // Then add any imported icons from diagramData that might be missing
    diagramImportedIcons.forEach(icon => {
      if (!iconMap.has(icon.id)) {
        iconMap.set(icon.id, icon);
      }
    });
    
    // Get all unique icons
    const allIcons = Array.from(iconMap.values());
    
    const exportData = {
      title: diagramName || modelToExport.title || 'Diagramme exporte',
      icons: allIcons, // Include ALL icons (default + imported) for portability
      colors: modelToExport.colors || [],
      items: modelToExport.items || [],
      views: modelToExport.views || [],
      fitToScreen: true
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'diagram'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowExportDialog(false);
    setHasUnsavedChanges(false); // Mark as saved after export
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Merge imported icons with default icon set
        const importedIcons = (parsedData.icons || []).filter((icon: any) => icon.collection === 'imported');
        const mergedIcons = [...icons, ...importedIcons];
        const mergedData: DiagramData = {
          ...parsedData,
          title: parsedData.title || 'Diagramme importe',
          icons: mergedIcons, // Merge default and imported icons
          colors: parsedData.colors?.length ? parsedData.colors : defaultColors,
          fitToScreen: parsedData.fitToScreen !== false
        };
        
        setDiagramData(mergedData);
        setDiagramName(parsedData.title || 'Diagramme importe');
        setCurrentModel(mergedData);
        setFossflowKey(prev => prev + 1); // Force re-render
        setShowImportDialog(false);
        setHasUnsavedChanges(true);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Success message
        setTimeout(() => {
          alert(`Le diagramme "${parsedData.title || 'Sans titre'}" a ete importe avec succes.`);
        }, 100);
      } catch (error) {
        alert('Fichier JSON invalide. Verifiez le format du fichier.');
      }
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier. Veuillez reessayer.');
    };
    
    reader.readAsText(file);
  };
  
  const importDiagram = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleDiagramManagerLoad = (id: string, data: any) => {
    // Load diagram from server storage
    // Server storage contains ALL icons (including imported), so use them directly
    const loadedIcons = data.icons || [];
    
    // Check if we have all default icons in the loaded data
    const hasAllDefaults = icons.every(defaultIcon => 
      loadedIcons.some((loadedIcon: any) => loadedIcon.id === defaultIcon.id)
    );
    
    // If the saved data has all icons, use it as-is
    // Otherwise, merge imported icons with defaults (for backward compatibility)
    let finalIcons;
    if (hasAllDefaults) {
      // Server saved all icons, use them directly
      finalIcons = loadedIcons;
    } else {
      // Old format or session storage - merge imported with defaults
      const importedIcons = loadedIcons.filter((icon: any) => icon.collection === 'imported');
      finalIcons = [...icons, ...importedIcons];
    }
    
    const mergedData: DiagramData = {
      ...data,
      title: data.title || data.name || 'Diagramme charge',
      icons: finalIcons,
      colors: data.colors?.length ? data.colors : defaultColors,
      fitToScreen: data.fitToScreen !== false
    };
    
    setDiagramData(mergedData);
    setDiagramName(data.name || 'Diagramme charge');
    setCurrentModel(mergedData);
    setCurrentDiagram({
      id,
      name: data.name || 'Diagramme charge',
      data: mergedData,
      createdAt: data.created || new Date().toISOString(),
      updatedAt: data.lastModified || new Date().toISOString()
    });
    setFossflowKey(prev => prev + 1); // Force re-render
    setHasUnsavedChanges(false);
  };
  
  // Auto-save functionality
  useEffect(() => {
    if (!currentModel || !hasUnsavedChanges || !currentDiagram) return;
    
    const autoSaveTimer = setTimeout(() => {
      // Include imported icons in auto-save
      const importedIcons = (currentModel?.icons || diagramData.icons || [])
        .filter(icon => icon.collection === 'imported');
      
      const savedData = {
        title: diagramName || currentDiagram.name,
        icons: importedIcons, // Save imported icons in auto-save
        colors: currentModel.colors || [],
        items: currentModel.items || [],
        views: currentModel.views || [],
        fitToScreen: true
      };
      
      const updatedDiagram: SavedDiagram = {
        ...currentDiagram,
        data: savedData,
        updatedAt: new Date().toISOString()
      };
      
      setDiagrams(prevDiagrams => 
        prevDiagrams.map(d => d.id === currentDiagram.id ? updatedDiagram : d)
      );
      
      // Update last opened data
      try {
        localStorage.setItem('fossflow-last-opened-data', JSON.stringify(savedData));
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error("Echec de l'enregistrement automatique :", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert("Stockage plein. Utilisez le gestionnaire de stockage pour liberer de l'espace.");
          setShowStorageManager(true);
        }
      }
    }, 5000); // Auto-save after 5 seconds of changes
    
    return () => clearTimeout(autoSaveTimer);
  }, [currentModel, hasUnsavedChanges, currentDiagram, diagramName, icons]);
  
  // Warn before closing if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non enregistrees. Voulez-vous vraiment quitter ?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="App">
      <div className="toolbar">
        <button onClick={newDiagram}>Nouveau diagramme</button>
        {serverStorageAvailable && (
          <button 
            onClick={() => setShowDiagramManager(true)}
            style={{ backgroundColor: '#2196F3', color: 'white' }}
          >
            🌐 Stockage serveur
          </button>
        )}
        <button onClick={() => setShowSaveDialog(true)}>Enregistrer (session uniquement)</button>
        <button onClick={() => setShowLoadDialog(true)}>Charger (session uniquement)</button>
        <button 
          onClick={() => setShowImportDialog(true)}
          style={{ backgroundColor: '#28a745' }}
        >
          📂 Importer un fichier
        </button>
        <button 
          onClick={() => setShowExportDialog(true)}
          style={{ backgroundColor: '#007bff' }}
        >
          💾 Exporter un fichier
        </button>
        <button 
          onClick={() => {
            if (currentDiagram && hasUnsavedChanges) {
              saveDiagram();
            }
          }}
          disabled={!currentDiagram || !hasUnsavedChanges}
          style={{ 
            backgroundColor: currentDiagram && hasUnsavedChanges ? '#ffc107' : '#6c757d',
            opacity: currentDiagram && hasUnsavedChanges ? 1 : 0.5,
            cursor: currentDiagram && hasUnsavedChanges ? 'pointer' : 'not-allowed'
          }}
          title="Enregistrer uniquement dans la session actuelle"
        >
          Enregistrement rapide (session)
        </button>
        <span className="current-diagram">
          {currentDiagram ? `Actuel : ${currentDiagram.name}` : diagramName || 'Diagramme sans titre'}
          {hasUnsavedChanges && <span style={{ color: '#ff9800', marginLeft: '10px' }}>• Modifie</span>}
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
            (Stockage de session uniquement - exportez pour conserver definitivement)
          </span>
        </span>
      </div>

      <div className="fossflow-container">
        <Isoflow 
          key={fossflowKey}
          initialData={diagramData}
          onModelUpdated={handleModelUpdated}
          editorMode="EDITABLE"
        />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Enregistrer le diagramme (session actuelle uniquement)</h2>
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeeba',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <strong>⚠️ Important :</strong> cet enregistrement est temporaire et sera perdu a la fermeture du navigateur.
              <br />
              Utilisez <strong>Exporter un fichier</strong> pour conserver votre travail definitivement.
            </div>
            <input
              type="text"
              placeholder="Saisir le nom du diagramme"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveDiagram()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={saveDiagram}>Enregistrer</button>
              <button onClick={() => setShowSaveDialog(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Charger un diagramme (session actuelle uniquement)</h2>
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeeba',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <strong>⚠️ Note :</strong> ces enregistrements sont temporaires. Exportez vos diagrammes pour les conserver definitivement.
            </div>
            <div className="diagram-list">
              {diagrams.length === 0 ? (
                <p>Aucun diagramme enregistre dans cette session</p>
              ) : (
                diagrams.map(diagram => (
                  <div key={diagram.id} className="diagram-item">
                    <div>
                      <strong>{diagram.name}</strong>
                      <br />
                      <small>Mis a jour : {new Date(diagram.updatedAt).toLocaleString()}</small>
                    </div>
                    <div className="diagram-actions">
                      <button onClick={() => loadDiagram(diagram)}>Charger</button>
                      <button onClick={() => deleteDiagram(diagram.id)}>Supprimer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowLoadDialog(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Import Dialog */}
      {showImportDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Importer un diagramme</h2>
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>Choisissez un fichier JSON a importer</p>
              <button 
                onClick={importDiagram}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Selectionner un fichier
              </button>
              <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                Format pris en charge : fichiers .json exportes depuis Isoflow
              </p>
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowImportDialog(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Exporter le diagramme</h2>
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>✅ Recommande :</strong> c'est la meilleure facon de conserver votre travail definitivement.
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                Les fichiers JSON exportes peuvent etre importes plus tard ou partages avec d'autres personnes.
              </p>
            </div>
            <div className="dialog-buttons">
              <button onClick={exportDiagram}>Telecharger le JSON</button>
              <button onClick={() => setShowExportDialog(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Manager */}
      {showStorageManager && (
        <StorageManager onClose={() => setShowStorageManager(false)} />
      )}

      {/* Diagram Manager */}
      {showDiagramManager && (
        <DiagramManager
          onLoadDiagram={handleDiagramManagerLoad}
          currentDiagramId={currentDiagram?.id}
          currentDiagramData={currentModel || diagramData}
          onClose={() => setShowDiagramManager(false)}
        />
      )}
    </div>
  );
}

export default App;
