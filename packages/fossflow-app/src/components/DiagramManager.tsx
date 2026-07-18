import React, { useState, useEffect } from 'react';
import { storageManager, DiagramInfo } from '../services/storageService';
import './DiagramManager.css';

interface Props {
  onLoadDiagram: (id: string, data: any) => void;
  currentDiagramId?: string;
  currentDiagramData?: any;
  onClose: () => void;
}

export const DiagramManager: React.FC<Props> = ({ 
  onLoadDiagram, 
  currentDiagramId, 
  currentDiagramData,
  onClose 
}) => {
  const [diagrams, setDiagrams] = useState<DiagramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServerStorage, setIsServerStorage] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize storage if not already done
      await storageManager.initialize();
      setIsServerStorage(storageManager.isServerStorage());
      
      // Load diagram list
      const storage = storageManager.getStorage();
      const list = await storage.listDiagrams();
      setDiagrams(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les diagrammes');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const storage = storageManager.getStorage();
      const data = await storage.loadDiagram(id);
      onLoadDiagram(id, data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le diagramme');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce diagramme ?')) {
      return;
    }

    try {
      const storage = storageManager.getStorage();
      await storage.deleteDiagram(id);
      await loadDiagrams(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le diagramme');
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      setError('Veuillez saisir un nom de diagramme');
      return;
    }

    try {
      const storage = storageManager.getStorage();
      
      // Check if a diagram with this name already exists (excluding current diagram)
      const existingDiagram = diagrams.find(d => 
        d.name === saveName.trim() && d.id !== currentDiagramId
      );
      
      if (existingDiagram) {
        const confirmOverwrite = window.confirm(
          `Un diagramme nomme "${saveName}" existe deja. Il sera remplace. Voulez-vous continuer ?`
        );
        if (!confirmOverwrite) {
          return;
        }
        
        // Delete the existing diagram first
        await storage.deleteDiagram(existingDiagram.id);
      }
      
      const dataToSave = {
        ...currentDiagramData,
        name: saveName
      };

      if (currentDiagramId) {
        // Update existing
        await storage.saveDiagram(currentDiagramId, dataToSave);
      } else {
        // Create new
        await storage.createDiagram(dataToSave);
      }

      setShowSaveDialog(false);
      setSaveName('');
      await loadDiagrams(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le diagramme");
    }
  };

  return (
    <div className="diagram-manager-overlay">
      <div className="diagram-manager">
        <div className="diagram-manager-header">
          <h2>Gestionnaire de diagrammes</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="storage-info">
          <span className={`storage-badge ${isServerStorage ? 'server' : 'local'}`}>
            {isServerStorage ? '🌐 Stockage serveur' : '💾 Stockage local'}
          </span>
          {isServerStorage && (
            <span className="storage-note">
              Les diagrammes sont enregistres sur le serveur et disponibles sur tous les appareils
            </span>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="diagram-manager-actions">
          <button 
            className="action-button primary"
            onClick={() => {
              setSaveName(currentDiagramData?.name || 'Diagramme sans titre');
              setShowSaveDialog(true);
            }}
          >
            💾 Enregistrer le diagramme actuel
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement des diagrammes...</div>
        ) : (
          <div className="diagram-list">
            {diagrams.length === 0 ? (
              <div className="empty-state">
                <p>Aucun diagramme enregistre</p>
                <p className="hint">Enregistrez votre diagramme actuel pour commencer</p>
              </div>
            ) : (
              diagrams.map(diagram => (
                <div key={diagram.id} className="diagram-item">
                  <div className="diagram-info">
                    <h3>{diagram.name}</h3>
                    <span className="diagram-meta">
                      Derniere modification : {diagram.lastModified.toLocaleString()}
                      {diagram.size && ` • ${(diagram.size / 1024).toFixed(1)} KB`}
                    </span>
                  </div>
                  <div className="diagram-actions">
                    <button 
                      className="action-button"
                      onClick={() => handleLoad(diagram.id)}
                    >
                      Charger
                    </button>
                    <button 
                      className="action-button danger"
                      onClick={() => handleDelete(diagram.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="save-dialog">
            <h3>Enregistrer le diagramme</h3>
            <input
              type="text"
              placeholder="Nom du diagramme"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={handleSave}>Enregistrer</button>
              <button onClick={() => setShowSaveDialog(false)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
