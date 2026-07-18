import './ErrorBoundary.css';

interface ErrorBoundaryFallbackUIProps {
  error: Error;
}

export default function ErrorBoundaryFallbackUI({
  error
}: ErrorBoundaryFallbackUIProps) {
  const onRefreshButtonPressed = () => {
    window.location.reload();
  };

  const onReportButtonPressed = () => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const githubUrl = new URL(
      'https://github.com/stan-smith/FossFLOW/issues/new'
    );
    githubUrl.searchParams.set('title', `Erreur : ${error.message}`);
    githubUrl.searchParams.set(
      'body',
      `## Details de l'erreur\n\n\`\`\`\n${JSON.stringify(errorDetails, null, 2)}\n\`\`\`\n\n## Etapes pour reproduire\n1. \n2. \n3. \n\n## Comportement attendu\n\n## Comportement observe\n\n## Environnement\n- Navigateur : ${navigator.userAgent}\n- URL : ${window.location.href}\n- Horodatage : ${new Date().toISOString()}`
    );

    window.open(githubUrl.toString(), '_blank');
  };

  return (
    <div className="error-page-container">
      <div className="error-container">
        <div className="error-header">
          <p>⚠️ Une erreur est survenue.</p>
        </div>
        <div className="error-content">
          <p>
            <strong>Erreur :</strong> {error.message}
          </p>
          {error.stack && (
            <details style={{ marginTop: '10px' }}>
              <summary
                style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}
              >
                Afficher les details techniques
              </summary>
              <pre
                style={{
                  fontSize: '11px',
                  color: '#666',
                  margin: '10px 0 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div
          style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#0c5460'
          }}
        >
          <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>
            📋 Avant de signaler cette erreur :
          </p>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px' }}>
            <li>
              Verifiez si cette erreur a deja ete signalee{' '}
              <a
                href="https://github.com/stan-smith/FossFLOW/issues"
                target="_"
              >
                ici
              </a>
            </li>
            <li>Essayez d'abord de recharger la page</li>
            <li>Signalez-la uniquement si c'est un nouveau probleme non repertorie</li>
          </ul>
          <p style={{ margin: 0, fontSize: '13px' }}>
            <strong>Note :</strong> si vous ne trouvez pas de probleme similaire,
            signalez-le avec les details ci-dessous.
          </p>
        </div>

        <div className="error-footer">
          <button className="error-button" onClick={onReportButtonPressed}>
            📋 Signaler le probleme
          </button>
          <button
            className="error-button refresh-button"
            onClick={onRefreshButtonPressed}
          >
            🔄 Recharger la page
          </button>
        </div>
      </div>
    </div>
  );
}
